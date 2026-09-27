import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

/**
 * Every "Admin" route in API_SPEC.md needs BOTH guards, in this order:
 *   @UseGuards(JwtAuthGuard, AdminGuard)
 * JwtAuthGuard runs first and populates `request.user`; AdminGuard then
 * just checks the `isAdmin` flag already on the token. It does not touch
 * the database - if a user's admin status is revoked, that takes effect
 * the next time they log in and get a fresh token, same tradeoff as any
 * stateless-JWT design.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
