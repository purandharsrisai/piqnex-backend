import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from './decorators/current-user.decorator';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      // Fail loudly at boot rather than silently signing/verifying tokens
      // with `undefined` as the secret.
      throw new Error(
        'JWT_SECRET is not set - copy .env.example to .env and fill it in',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /** Runs once the token's signature and expiry are already verified.
   * Whatever is returned here becomes `request.user`. */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // One cheap lookup so suspending an account takes effect immediately
    // instead of when the token expires.
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { status: true },
    });
    if (!user || user.status === 'suspended') {
      throw new UnauthorizedException('This account is not available');
    }
    return {
      id: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
      role: payload.role ?? null,
    };
  }
}
