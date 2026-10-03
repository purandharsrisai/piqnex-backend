import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';

/**
 * Authentication for the separate Admin Dashboard app (piqnex-admin).
 * Deliberately its own service - NOT a wrapper around AuthService.login() -
 * per the "the Admin Dashboard is a separate website" requirement: a
 * regular user's credentials being valid for POST /auth/login says nothing
 * about whether they should ever reach this endpoint, and keeping the code
 * path separate means a future change to user login (rate limiting, OAuth,
 * 2FA, ...) can't accidentally loosen or break admin auth, and vice versa.
 * It does share the same PrismaService/JwtService infrastructure as the
 * rest of the app (same database, same JWT_SECRET) - only the
 * authentication/authorization logic itself is independent.
 */
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // One generic error for "no such user", "wrong password", AND "this
    // account exists but isn't an admin" - telling these apart would let
    // someone probe which emails exist, and separately, which ones are
    // admins.
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

    if (!user.isAdmin) {
      throw invalidCredentials();
    }

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
