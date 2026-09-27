import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactRequestDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  message!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  contactInfo?: string;
}
