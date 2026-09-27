import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

function contextWithUser(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  } as unknown as ExecutionContext;
}

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('allows a request from an admin user', () => {
    const context = contextWithUser({
      id: '1',
      email: 'admin@example.com',
      isAdmin: true,
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a request from a non-admin user', () => {
    const context = contextWithUser({
      id: '2',
      email: 'user@example.com',
      isAdmin: false,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects a request with no user at all (guard used without JwtAuthGuard first)', () => {
    const context = contextWithUser(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
