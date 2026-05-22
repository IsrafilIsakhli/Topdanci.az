import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { CategoryStatus } from '@prisma/client';

export class CreateAdminCategoryDto {
  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(140)
  slug?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  icon?: string;

  @IsInt()
  @Min(0)
  @Max(10000)
  @IsOptional()
  @Type(() => Number)
  sortOrder = 0;
}

export class UpdateAdminCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(140)
  slug?: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  icon?: string | null;

  @IsInt()
  @Min(0)
  @Max(10000)
  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsEnum(CategoryStatus)
  @IsOptional()
  status?: CategoryStatus;
}
