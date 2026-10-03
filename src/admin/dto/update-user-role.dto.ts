import { IsIn } from 'class-validator';
import { ADMIN_ROLE_ASSIGNMENTS } from '../admin.constants';
import type { AdminRoleAssignment } from '../admin.constants';

export class UpdateUserRoleDto {
  // 'ADMIN' | 'MODERATOR' | 'NONE' - 'NONE' revokes admin access entirely.
  @IsIn(ADMIN_ROLE_ASSIGNMENTS)
  role!: AdminRoleAssignment;
}
