import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reviewNote!: string;
}

export class SuspendProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  reviewNote?: string;
}
