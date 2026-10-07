import { IsOptional, Matches, IsString, MinLength } from 'class-validator';

export class MobileRefreshDto {
  @IsString()
  @MinLength(20)
  refreshToken!: string;
  @IsOptional() @Matches(/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]{8,200}\]$/) pushToken?: string;
}
