// Same pattern as listing.constants.ts / need-request.constants.ts: a plain
// string column + class-validator @IsIn, not a native Postgres enum, kept
// consistent with every other status-like field in this schema.
//
// Only ever set on a user who also has isAdmin = true - role is "which kind
// of admin", not "is this person an admin at all" (that's still isAdmin,
// see AdminGuard). A regular, non-admin user always has role = null.
export const ADMIN_ROLES = ['ADMIN', 'MODERATOR'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

// What PATCH /admin/users/:id/role accepts - adds 'NONE' on top of the
// two real roles, meaning "revoke admin access entirely" (sets both
// isAdmin=false and role=null).
export const ADMIN_ROLE_ASSIGNMENTS = [...ADMIN_ROLES, 'NONE'] as const;
export type AdminRoleAssignment = (typeof ADMIN_ROLE_ASSIGNMENTS)[number];
