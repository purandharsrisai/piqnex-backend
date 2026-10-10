import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';

// Cost factor for bcrypt's hashing rounds. 10 is bcrypt's own recommended
// default - a good balance of "slow enough to resist brute-forcing" and
// "fast enough not to make every signup/login noticeably slow".
const SALT_ROUNDS = 10;

// How long a "forgot password" reset token stays valid for.
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  // 'ADMIN' | 'MODERATOR' | null - see admin/admin.constants.ts. Only
  // meaningful when isAdmin is true.
  role: string | null;
  passwordHash: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        displayName: dto.displayName,
        phone: dto.phone,
      },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // Deliberately the same error for "no such user" and "wrong password" -
    // telling them apart lets an attacker enumerate which emails have
    // accounts.
    const invalidCredentials = () =>
      new UnauthorizedException('Invalid email or password');

    if (!user) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    return this.buildAuthResponse(user);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const currentMatches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!currentMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const sameAsOld = await bcrypt.compare(dto.newPassword, user.passwordHash);
    if (sameAsOld) {
      throw new ConflictException(
        'New password must be different from your current password',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const genericMessage =
      'If an account exists for that email, you can now reset its password.';

    if (!user) {
      // Same message as the "found" case below, just without a
      // resetToken - the frontend only continues to the reset-password
      // page when one is present. Keeps a non-existent email from getting
      // an obviously different response, though see the big note below.
      return { message: genericMessage };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    // IMPORTANT, TEMPORARY: there's no email sending set up in this project
    // yet, so the raw token is handed straight back in the response below,
    // and the frontend immediately takes the user to the reset-password
    // page with it. That means right now, knowing (or guessing) a user's
    // email address is ALL that's needed to reset that user's password -
    // there's no proof the requester actually owns that inbox. That's fine
    // for local development/testing but must not ship to real users like
    // this. When email sending is added, stop returning resetToken here and
    // email it to dto.email instead - the hashing, expiry and single-use
    // checks below already work correctly either way.
    await this.mail.sendPasswordReset(user.email, token);
    // With a live mail provider the token travels only by email. In dev
    // (console provider) it's still returned so the flow works locally.
    return this.mail.isLive
      ? { message: genericMessage }
      : { message: genericMessage, resetToken: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = createHash('sha256').update(dto.token).digest('hex');
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    const invalidOrExpired = () =>
      new BadRequestException('This reset link is invalid or has expired');

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw invalidOrExpired();
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      // Also throw away any other outstanding reset tokens for this user,
      // so an old, forgotten-about reset link can't be used afterwards too.
      this.prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId, id: { not: resetToken.id } },
      }),
    ]);

    return { message: 'Password updated' };
  }

  buildAuthResponse(user: UserRecord) {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    };
  }
}
