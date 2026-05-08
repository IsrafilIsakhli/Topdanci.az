import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListStoresQueryDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  q?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  city?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;
}
