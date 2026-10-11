import { IsIn } from 'class-validator';
import { USER_STATUSES } from '../admin.constants';
import type { UserStatus } from '../admin.constants';

export class UpdateUserStatusDto {
  // 'active' | 'suspended'
  @IsIn(USER_STATUSES)
  status!: UserStatus;
}
