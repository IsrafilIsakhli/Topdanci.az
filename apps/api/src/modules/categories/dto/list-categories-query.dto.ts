import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ListCategoriesQueryDto {
  @IsString()
  @IsOptional()
  @MaxLength(120)
  q?: string;
}
