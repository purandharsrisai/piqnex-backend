import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to specific admin roles (see admin/admin.constants.ts
 * for the allowed values), on top of whatever JwtAuthGuard/AdminGuard
 * already require. Stack it with RolesGuard:
 *
 *   @UseGuards(JwtAuthGuard, AdminGuard, RolesGuard)
 *   @Roles('ADMIN')
 *   @Delete('categories/:id')
 *   ...
 *
 * A route with no @Roles() at all is left alone by RolesGuard (every admin,
 * regardless of role, can call it) - this decorator is only for the subset
 * of admin routes a Moderator shouldn't reach.
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
