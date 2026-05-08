import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStoreApplicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  contactName!: string;

  @IsString()
  @MinLength(7)
  @MaxLength(32)
  contactPhone!: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  companyName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  taxNumber?: string;

  @IsString()
  @MaxLength(80)
  city!: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  district?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1200)
  description?: string;
}
