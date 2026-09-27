import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Powers GET /need-requests/match - open need requests matching a listing
 * that was just published, shown to the seller right after posting.
 */
export class MatchNeedRequestsQueryDto {
  @IsString() @MaxLength(120) brandName!: string;
  @IsString() @MaxLength(120) productName!: string;
  @IsOptional() @IsString() @MaxLength(120) modelLabel?: string;
  @IsString() @MaxLength(120) partName!: string;
}
