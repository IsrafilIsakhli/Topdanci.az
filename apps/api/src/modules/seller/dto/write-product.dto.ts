import { PriceType, ProductUnit } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateSellerProductDto {
  @IsString()
  storeId!: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  title!: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @IsString()
  @IsOptional()
  @MaxLength(8)
  currency?: string;

  @IsEnum(ProductUnit)
  @IsOptional()
  unit?: ProductUnit;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderQuantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  stockStatus?: string;
}

export class UpdateSellerProductDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(180)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsEnum(PriceType)
  @IsOptional()
  priceType?: PriceType;

  @IsString()
  @IsOptional()
  @MaxLength(8)
  currency?: string;

  @IsEnum(ProductUnit)
  @IsOptional()
  unit?: ProductUnit;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderQuantity?: number;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  stockStatus?: string;
}
