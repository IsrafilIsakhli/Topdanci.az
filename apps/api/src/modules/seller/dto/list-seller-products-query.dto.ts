import { ProductStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListSellerProductsQueryDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;
}
