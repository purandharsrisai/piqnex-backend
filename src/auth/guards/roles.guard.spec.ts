import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function contextWithUser(
  user: unknown,
  metadata: string[] | undefined,
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

function makeGuard(metadata: string[] | undefined) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(metadata),
  } as unknown as Reflector;
  return new RolesGuard(reflector);
}

describe('RolesGuard', () => {
  it('allows any request through when the route has no @Roles() at all', () => {
    const guard = makeGuard(undefined);
    const context = contextWithUser(
      { id: '1', email: 'mod@example.com', isAdmin: true, role: 'MODERATOR' },
      undefined,
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows a user whose role is in the required list', () => {
    const guard = makeGuard(['ADMIN']);
    const context = contextWithUser(
      { id: '1', email: 'admin@example.com', isAdmin: true, role: 'ADMIN' },
      ['ADMIN'],
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a user whose role is not in the required list', () => {
    const guard = makeGuard(['ADMIN']);
    const context = contextWithUser(
      { id: '2', email: 'mod@example.com', isAdmin: true, role: 'MODERATOR' },
      ['ADMIN'],
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects a user with no role at all', () => {
    const guard = makeGuard(['ADMIN']);
    const context = contextWithUser(
      { id: '3', email: 'user@example.com', isAdmin: false, role: null },
      ['ADMIN'],
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
