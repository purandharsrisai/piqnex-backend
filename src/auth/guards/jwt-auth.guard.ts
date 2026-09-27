import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Apply with @UseGuards(JwtAuthGuard) on any "Logged in" or "Owner" route
 * from API_SPEC.md. Reads the `Authorization: Bearer <token>` header,
 * verifies it, and attaches the result of JwtStrategy.validate() to
 * `request.user` (see decorators/current-user.decorator.ts to read it back).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
