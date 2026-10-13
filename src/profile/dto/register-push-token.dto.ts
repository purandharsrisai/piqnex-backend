import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  // Expo push token, e.g. "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]".
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  token!: string;

  @IsIn(['ios', 'android'])
  platform!: string;
}
