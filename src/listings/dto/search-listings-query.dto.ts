import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { LISTING_CONDITIONS } from '../listing.constants';
import type { ListingCondition } from '../listing.constants';

export class SearchListingsQueryDto {
  @IsOptional() @IsString() category?: string; // category slug
  @IsOptional() @IsString() brand?: string; // brand slug
  @IsOptional() @IsString() q?: string; // free-text search

  @IsOptional()
  @IsIn(LISTING_CONDITIONS)
  condition?: ListingCondition;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) minPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) maxPrice?: number;
  @IsOptional() @IsString() location?: string;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc'])
  sort?: 'newest' | 'price_asc' | 'price_desc';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number;
}
