import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const REPORT_REASONS = ['spam', 'scam', 'prohibited', 'inappropriate', 'other'] as const;

export class CreateReportDto {
  @IsIn(['listing', 'user'])
  targetType!: 'listing' | 'user';

  @IsUUID()
  targetId!: string;

  @IsIn(REPORT_REASONS as unknown as string[])
  reason!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;
}
