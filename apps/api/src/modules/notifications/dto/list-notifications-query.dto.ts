import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListNotificationsQueryDto {
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
