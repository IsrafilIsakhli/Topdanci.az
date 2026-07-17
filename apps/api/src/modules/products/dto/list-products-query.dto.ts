import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export const productSortOptions = ['newest', 'popular', 'price_asc', 'price_desc'] as const;
export type ProductSort = (typeof productSortOptions)[number];

export class ListProductsQueryDto {
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

  @IsString()
  @IsOptional()
  @MaxLength(120)
  store?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;

  @IsIn(productSortOptions)
  @IsOptional()
  sort: ProductSort = 'newest';
}
