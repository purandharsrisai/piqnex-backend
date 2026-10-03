import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * Deliberately a separate DTO from auth/dto/login.dto.ts, even though the
 * shape is identical today - this endpoint is the Admin Dashboard's own
 * login contract and is free to diverge (e.g. add a 2FA code field) without
 * touching regular user login.
 */
export class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
