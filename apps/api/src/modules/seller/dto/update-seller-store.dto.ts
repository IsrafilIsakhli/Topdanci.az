import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSellerStoreDto {
  @IsString()
  @MaxLength(140)
  @IsOptional()
  name?: string;

  @IsString()
  @MaxLength(180)
  @IsOptional()
  legalName?: string;

  @IsString()
  @MaxLength(1600)
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  city?: string;

  @IsString()
  @MaxLength(80)
  @IsOptional()
  district?: string;

  @IsString()
  @MaxLength(220)
  @IsOptional()
  address?: string;

  @IsString()
  @MaxLength(40)
  @IsOptional()
  phone?: string;

  @IsString()
  @MaxLength(40)
  @IsOptional()
  whatsappNumber?: string;

  @IsString()
  @MaxLength(180)
  @IsOptional()
  email?: string;

  @IsObject()
  @IsOptional()
  workingHours?: Record<string, unknown>;
}
