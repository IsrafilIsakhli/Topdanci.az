import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Max, Min } from 'class-validator';

export class ListNotificationsQueryDto {
  @IsOptional() @IsString() @MaxLength(100) cursor?: string;
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit = 20;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  unreadOnly = false;
}
