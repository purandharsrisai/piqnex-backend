import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72) // bcrypt silently truncates anything longer than this
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  displayName!: string;

  // Required at signup. Loosely validated on purpose - international phone
  // formats vary a lot (spaces, dashes, parens, a leading +); this just
  // rejects obvious junk, it's not a strict E.164 check. Can still be
  // changed later from the profile page (UpdateProfileDto), where it
  // remains optional - this is the only place it's mandatory.
  @IsString()
  @MinLength(6, { message: 'Enter a valid phone number' })
  @MaxLength(20)
  @Matches(/^[0-9+()\-\s]{6,20}$/, {
    message: 'Enter a valid phone number',
  })
  phone!: string;
}
