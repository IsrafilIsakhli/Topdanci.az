import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListProductsQueryDto {
  @IsString()
  @IsOptional()
  q?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
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
