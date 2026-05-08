import { IsEnum, IsOptional, IsString } from 'class-validator';

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
  storeId!: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  source?: string;

  @IsString()
  @IsOptional()
  anonymousId?: string;
}
