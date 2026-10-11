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

  // Required at signup: exactly 10 digits, no country code. Can still be
  // changed later from the profile page (UpdateProfileDto), where it
  // remains optional and more loosely validated.
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Enter a 10-digit phone number',
  })
  phone!: string;
}
