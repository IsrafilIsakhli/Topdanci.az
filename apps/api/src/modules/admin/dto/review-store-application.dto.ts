import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ApproveStoreApplicationDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  storeSlug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewNote?: string;
}

export class RejectStoreApplicationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reviewNote!: string;
}
