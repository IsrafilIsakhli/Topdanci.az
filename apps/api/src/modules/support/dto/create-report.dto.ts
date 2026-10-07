import { Transform } from 'class-transformer';
import { IsIn, IsString, Length } from 'class-validator';
export class CreateReportDto {
 @IsIn(['product','store'], { message: 'Şikayət növü düzgün deyil.' }) kind!: 'product' | 'store';
 @IsString() @Length(1,160) targetId!: string;
 @IsIn(['wrong_information','unavailable','suspicious','other'], { message: 'Səbəbi seçin.' }) reason!: string;
 @Transform(({value}:{value:unknown})=>typeof value==='string'?value.trim():value)
 @IsString() @Length(10,1200, { message: 'İzahı 10–1200 simvolla yazın.' }) message!: string;
}