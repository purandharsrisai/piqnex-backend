import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const CONTACT_TOPICS = [
  'account',
  'listing',
  'report',
  'feedback',
  'other',
] as const;

export class ContactFormDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsIn(CONTACT_TOPICS)
  topic!: (typeof CONTACT_TOPICS)[number];

  @IsString()
  @MinLength(10, { message: 'Please write at least 10 characters' })
  @MaxLength(2000)
  message!: string;

  // Honeypot: hidden from people, filled in by bots. Real users leave it empty.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string;
}
