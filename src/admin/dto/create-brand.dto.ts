import { IsString, IsUUID, Matches, MaxLength } from 'class-validator';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class CreateBrandDto {
  @IsUUID() categoryId!: string;

  @IsString()
  @Matches(SLUG_PATTERN, { message: 'slug must be lowercase and hyphenated' })
  slug!: string;

  @IsString() @MaxLength(80) name!: string;
}
