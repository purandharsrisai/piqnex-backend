import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export const SUPPORT_MESSAGE_STATUSES = ['new', 'handled'] as const;
export type SupportMessageStatus = (typeof SUPPORT_MESSAGE_STATUSES)[number];

export class UpdateSupportMessageStatusDto {
  @IsIn(SUPPORT_MESSAGE_STATUSES)
  status!: SupportMessageStatus;
}

/** ?page=1&status=new - status is optional (omit for every message). */
export class SupportMessagesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(SUPPORT_MESSAGE_STATUSES)
  status?: SupportMessageStatus;
}
