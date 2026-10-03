import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string;

  // Loosely validated on purpose - international phone formats vary a lot
  // (spaces, dashes, parens, a leading +). This just rejects obvious junk,
  // it's not a strict E.164 check.
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[0-9+()\-\s]{6,20}$/, {
    message: 'Enter a valid phone number',
  })
  phone?: string;
}
