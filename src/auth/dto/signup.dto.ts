import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

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
}
