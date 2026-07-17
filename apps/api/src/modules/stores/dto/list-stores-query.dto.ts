import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const storeSortOptions = ['newest', 'popular', 'products'] as const;
export type StoreSort = (typeof storeSortOptions)[number];

export class ListStoresQueryDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  q?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  city?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;

  @IsIn(storeSortOptions)
  @IsOptional()
  sort: StoreSort = 'newest';
}
