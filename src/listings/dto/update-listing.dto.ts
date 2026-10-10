import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { LISTING_CONDITIONS } from '../listing.constants';
import type { ListingCondition } from '../listing.constants';

/** PATCH /listings/:id - every field optional; only the owner may edit. */
export class UpdateListingDto {
  @IsOptional() @IsString() @MaxLength(120) brandName?: string;
  @IsOptional() @IsString() @MaxLength(120) productName?: string;
  @IsOptional() @IsString() @MaxLength(120) modelLabel?: string;
  @IsOptional() @IsString() @MaxLength(120) partName?: string;

  @IsOptional()
  @IsIn(LISTING_CONDITIONS)
  condition?: ListingCondition;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) price?: number;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;

  // When present, replaces the listing's photos (in display order).
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagePaths?: string[];
}
