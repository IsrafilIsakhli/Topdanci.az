import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum LeadEventTypeDto {
  WHATSAPP_CLICK = 'WHATSAPP_CLICK',
  PHONE_REVEAL = 'PHONE_REVEAL',
  EMAIL_CLICK = 'EMAIL_CLICK',
  STORE_VIEW = 'STORE_VIEW',
  PRODUCT_VIEW = 'PRODUCT_VIEW',
}

export class CreateLeadEventDto {
  @IsEnum(LeadEventTypeDto)
  type!: LeadEventTypeDto;

  @IsString()
  @MaxLength(64)
  storeId!: string;

  @IsString()
  @IsOptional()
  @MaxLength(64)
  productId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  source?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  anonymousId?: string;
}
