import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// Same slug shape used across the app (see catalog/dto/list-brands-query.dto.ts).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateCategoryDto {
  @IsString()
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase and hyphenated' })
  slug!: string;

  @IsString() @MaxLength(80) name!: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsInt() sortOrder?: number;
}
