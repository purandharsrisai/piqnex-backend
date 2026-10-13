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

  // Optional, but if given it must be exactly 10 digits (no country code),
  // same as at signup.
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{10}$/, {
    message: 'Enter a 10-digit phone number',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  bio?: string;

  // Profile photo: '' removes it. Otherwise a small square JPEG sent as a
  // data URL (the site resizes it to ~256px before upload) or an https link.
  // TODO: move photos to object storage (R2/S3) once UploadsService is wired
  // up, then store only the URL here.
  @IsOptional()
  @IsString()
  @MaxLength(80000)
  @Matches(/^(data:image\/jpeg;base64,[A-Za-z0-9+/=]+|https:\/\/\S+)?$/, {
    message: 'Invalid profile photo',
  })
  avatarUrl?: string;
}
