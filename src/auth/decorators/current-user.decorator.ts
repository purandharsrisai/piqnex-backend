import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/** What `request.user` looks like once JwtStrategy has run (see jwt.strategy.ts). */
export interface AuthenticatedUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Use inside any route protected by JwtAuthGuard to get the calling user
 * without touching `request` directly:
 *
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   me(@CurrentUser() user: AuthenticatedUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>();
    return request.user;
  },
);
