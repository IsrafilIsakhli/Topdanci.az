import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsString, Length, ValidateNested } from 'class-validator';
export class LibraryChangeDto {
  @IsIn(['product', 'store'], { message: 'Seçim növü düzgün deyil.' }) kind!: 'product' | 'store';
  @IsString() @Length(1, 160) id!: string;
  @Transform(({obj}:{obj:Record<string,unknown>})=>obj.saved)
  @IsBoolean({ message: 'Seçimin vəziyyəti düzgün deyil.' }) saved!: boolean;
}
export class SyncLibraryDto {
  @IsArray() @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => LibraryChangeDto)
  changes!: LibraryChangeDto[];
}