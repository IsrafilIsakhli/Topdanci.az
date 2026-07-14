import { LeadType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SellerAnalyticsQueryDto {
  @IsString()
  @IsOptional()
  storeId?: string;

  @IsIn(['7d', '30d', '90d'])
  @IsOptional()
  range: '7d' | '30d' | '90d' = '30d';
}

export class ListSellerLeadsQueryDto extends SellerAnalyticsQueryDto {
  @IsEnum(LeadType)
  @IsOptional()
  type?: LeadType;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit = 30;

  @IsString()
  @IsOptional()
  cursor?: string;
}
