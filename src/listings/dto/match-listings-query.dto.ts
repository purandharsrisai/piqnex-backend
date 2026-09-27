import { IsOptional, IsString, MaxLength } from 'class-validator';

/** Powers GET /listings/match - the exact-match results for the "I Need" search. */
export class MatchListingsQueryDto {
  @IsString() @MaxLength(120) brandName!: string;
  @IsString() @MaxLength(120) productName!: string;
  @IsOptional() @IsString() @MaxLength(120) modelLabel?: string;
  @IsString() @MaxLength(120) partName!: string;
}
