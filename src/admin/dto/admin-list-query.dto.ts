import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * ?page=1&q=hinge&status=active - what the admin Listings and Need Requests
 * tables send. Both filters are optional; the status value itself is
 * validated by the service (it differs per table), so an unknown status
 * simply matches nothing.
 */
export class AdminListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  /** Only this user's records: the seller of a listing / the requester of a need request. */
  @IsOptional()
  @IsUUID()
  userId?: string;
}
