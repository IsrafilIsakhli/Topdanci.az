import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSupportRequestDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  subject?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1600)
  message!: string;
}
