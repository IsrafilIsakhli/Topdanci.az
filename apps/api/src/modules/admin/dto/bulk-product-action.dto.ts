import { ArrayMaxSize, ArrayMinSize, IsArray, IsString, MaxLength, MinLength } from 'class-validator';

export class BulkProductActionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  ids!: string[];
}

export class BulkRejectProductsDto extends BulkProductActionDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reviewNote!: string;
}

export class FlagProductDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  reason!: string;
}
