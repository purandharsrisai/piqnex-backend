import { IsOptional, IsString, Matches } from 'class-validator';

// Same slug shape the frontend already validates categories/brands against
// (see missing-piece-marketplace/src/lib/validations.ts's slugPattern).
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class ListBrandsQueryDto {
  /** GET /brands?category=<slug> - omit to list every brand. */
  @IsOptional()
  @IsString()
  @Matches(SLUG_PATTERN, {
    message: 'category must be a lowercase, hyphenated slug',
  })
  category?: string;
}
