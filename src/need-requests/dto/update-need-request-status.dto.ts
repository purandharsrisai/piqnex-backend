import { IsIn } from 'class-validator';
import { NEED_REQUEST_STATUSES } from '../need-request.constants';
import type { NeedRequestStatus } from '../need-request.constants';

export class UpdateNeedRequestStatusDto {
  @IsIn(NEED_REQUEST_STATUSES)
  status!: NeedRequestStatus;
}
