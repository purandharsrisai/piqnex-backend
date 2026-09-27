import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { LISTING_CONDITIONS } from '../listing.constants';
import type { ListingCondition } from '../listing.constants';

export class CreateListingDto {
  // Optional links into the structured catalog - most listings will be
  // free text only, since the catalog starts nearly empty (see schema.prisma).
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsUUID() brandId?: string;
  @IsOptional() @IsUUID() productId?: string;
  @IsOptional() @IsUUID() modelId?: string;
  @IsOptional() @IsUUID() partId?: string;

  @IsString() @MaxLength(120) brandName!: string;
  @IsString() @MaxLength(120) productName!: string;
  @IsOptional() @IsString() @MaxLength(120) modelLabel?: string;
  @IsString() @MaxLength(120) partName!: string;

  @IsIn(LISTING_CONDITIONS)
  condition!: ListingCondition;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional() @IsString() @MaxLength(8) currency?: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;

  // Storage paths returned by POST /uploads/listing-image, in display order.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagePaths?: string[];
}
