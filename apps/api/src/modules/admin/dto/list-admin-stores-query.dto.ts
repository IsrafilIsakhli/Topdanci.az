import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { StoreStatus } from '@prisma/client';

export class ListAdminStoresQueryDto {
  @IsEnum(StoreStatus)
  @IsOptional()
  status?: StoreStatus;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  q?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;
}
