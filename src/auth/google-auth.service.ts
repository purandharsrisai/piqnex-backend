import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

/** Only same-site relative paths are allowed as post-login destinations. */
function safeRedirect(path?: string): string {
  return path && /^\/(?!\/)[\w\-./?=&%]*$/.test(path) ? path : '/profile';
}

/**
 * "Continue with Google": OAuth 2.0 authorization-code flow, handled
 * entirely on the backend so the client secret never reaches the browser.
 *
 *  browser -> GET /auth/google -> Google -> GET /auth/google/callback
 *  -> redirect to the frontend with a one-time 60s "handoff" code
 *  -> frontend server POSTs it to /auth/google/exchange for the real JWT.
 *
 * `state` and the handoff code are signed with a secret derived from
 * JWT_SECRET (not JWT_SECRET itself), so neither can ever be replayed as an
 * access token.
 */
@Injectable()
export class GoogleAuthService {
  private readonly log = new Logger(GoogleAuthService.name);
  private readonly usedHandoffs = new Map<string, number>();

  constructor(
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly auth: AuthService,
  ) {}

  get enabled(): boolean {
    return !!(this.config.get('GOOGLE_CLIENT_ID') && this.config.get('GOOGLE_CLIENT_SECRET'));
  }

  private get signingSecret() {
    return `${this.config.get<string>('JWT_SECRET')}:google-oauth`;
  }
  private get frontend() {
    return (this.config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:3000').replace(/\/+$/, '');
  }
  /** Must exactly match an "Authorized redirect URI" in Google Cloud. */
  get callbackUrl() {
    const base =
      this.config.get<string>('BACKEND_URL') ?? `http://localhost:${this.config.get('PORT') ?? 3000}`;
    return `${base.replace(/\/+$/, '')}/auth/google/callback`;
  }
  private url(key: string, fallback: string) {
    return this.config.get<string>(key) ?? fallback;
  }

  authorizeUrl(redirectTo?: string): string {
    if (!this.enabled) throw new BadRequestException('Google login is not configured');
    const state = this.jwt.sign(
      { purpose: 'google-state', r: safeRedirect(redirectTo) },
      { secret: this.signingSecret, expiresIn: '10m' },
    );
    const params = new URLSearchParams({
      client_id: this.config.get<string>('GOOGLE_CLIENT_ID')!,
      redirect_uri: this.callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
    });
    return `${this.url('GOOGLE_AUTH_URL', 'https://accounts.google.com/o/oauth2/v2/auth')}?${params}`;
  }

  /** Returns the frontend URL to send the browser to (success or error). */
  async handleCallback(code?: string, state?: string, error?: string): Promise<string> {
    const fail = (reason: string) => `${this.frontend}/login?google=${reason}`;
    if (error || !code || !state) return fail('cancelled');

    let redirectTo = '/profile';
    try {
      const s = this.jwt.verify<{ purpose: string; r: string }>(state, { secret: this.signingSecret });
      if (s.purpose !== 'google-state') return fail('failed');
      redirectTo = safeRedirect(s.r);
    } catch {
      return fail('failed');
    }

    try {
      const info = await this.fetchGoogleUser(code);
      if (!info.email || !info.email_verified) return fail('unverified');
      const user = await this.findOrCreate(info);
      const handoff = this.jwt.sign(
        { purpose: 'google-handoff', uid: user.id, r: redirectTo },
        { secret: this.signingSecret, expiresIn: '60s', jwtid: randomBytes(12).toString('hex') },
      );
      return `${this.frontend}/auth/google/complete?code=${encodeURIComponent(handoff)}`;
    } catch (e) {
      this.log.error(`Google login failed: ${(e as Error).message}`);
      return fail('failed');
    }
  }

  /** Single-use: trades the handoff code for a normal login response. */
  async exchange(code: string) {
    let p: { purpose: string; uid: string; r: string; jti?: string };
    try {
      p = this.jwt.verify(code, { secret: this.signingSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired code');
    }
    const now = Date.now();
    for (const [k, exp] of this.usedHandoffs) if (exp < now) this.usedHandoffs.delete(k);
    if (p.purpose !== 'google-handoff' || !p.jti || this.usedHandoffs.has(p.jti)) {
      throw new UnauthorizedException('Invalid or expired code');
    }
    this.usedHandoffs.set(p.jti, now + 120_000);

    const user = await this.prisma.user.findUnique({ where: { id: p.uid } });
    if (!user) throw new UnauthorizedException('Account no longer exists');
    return { ...this.auth.buildAuthResponse(user), redirectTo: safeRedirect(p.r) };
  }

  private async fetchGoogleUser(code: string): Promise<GoogleUserInfo> {
    const tokenRes = await fetch(this.url('GOOGLE_TOKEN_URL', 'https://oauth2.googleapis.com/token'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.config.get<string>('GOOGLE_CLIENT_ID')!,
        client_secret: this.config.get<string>('GOOGLE_CLIENT_SECRET')!,
        redirect_uri: this.callbackUrl,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error(`token exchange ${tokenRes.status}`);
    const { access_token } = (await tokenRes.json()) as { access_token?: string };
    if (!access_token) throw new Error('no access_token');

    const infoRes = await fetch(
      this.url('GOOGLE_USERINFO_URL', 'https://openidconnect.googleapis.com/v1/userinfo'),
      { headers: { Authorization: `Bearer ${access_token}` } },
    );
    if (!infoRes.ok) throw new Error(`userinfo ${infoRes.status}`);
    return (await infoRes.json()) as GoogleUserInfo;
  }

  private async findOrCreate(info: GoogleUserInfo) {
    const email = info.email!.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) return existing;
    // Google users have no password of their own: store an unguessable hash
    // (they can still use "Forgot password" later to set one).
    const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: (info.name ?? email.split('@')[0]).slice(0, 80),
        avatarUrl: info.picture,
      },
    });
  }
}
