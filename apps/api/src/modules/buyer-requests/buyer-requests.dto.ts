import { Transform, Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
const trim = ({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value;
export class CreateBuyerRequestDto {
  @IsString({message:'Məhsulun adını yazın.'}) @MinLength(4,{message:'Məhsulun adı ən az 4 simvol olmalıdır.'}) @MaxLength(160,{message:'Məhsulun adı çox uzundur.'}) @Transform(trim) title!: string;
  @IsNumber({maxDecimalPlaces:3},{message:'Miqdarı rəqəmlə yazın (ən çox 3 onluq rəqəm).'}) @Min(0.001,{message:'Miqdar sıfırdan böyük olmalıdır.'}) @Max(100000000,{message:'Miqdar çox böyükdür.'}) @Type(()=>Number) quantity!:number;
  @IsIn(['ədəd','cüt','kq','metr','qutu','palet','dəst','litr'],{message:'Düzgün miqdar vahidi seçin.'}) unit!:string;
  @IsString({message:'Şəhəri yazın.'}) @MinLength(2,{message:'Şəhərin adını düzgün yazın.'}) @MaxLength(80,{message:'Şəhərin adı çox uzundur.'}) @Transform(trim) city!:string;
  @IsOptional() @IsString({message:'Kateqoriyanı düzgün seçin.'}) @MaxLength(120,{message:'Kateqoriya adı çox uzundur.'}) category?:string;
  @IsOptional() @IsString({message:'Əlavə məlumatı mətnlə yazın.'}) @MaxLength(1200,{message:'Əlavə məlumat ən çox 1200 simvol ola bilər.'}) @Transform(trim) description?:string;
}
export class ListBuyerRequestsDto {
 @IsOptional() @IsString({message:'Axtarış mətnini düzgün yazın.'}) @MaxLength(120,{message:'Axtarış mətni çox uzundur.'}) q?:string;
 @IsOptional() @IsString({message:'Şəhəri düzgün yazın.'}) @MaxLength(80,{message:'Şəhərin adı çox uzundur.'}) city?:string;
 @IsOptional() @IsString({message:'Kateqoriyanı düzgün seçin.'}) @MaxLength(120,{message:'Kateqoriya adı çox uzundur.'}) category?:string;
 @IsOptional() @IsString({message:'Səhifə açarı düzgün deyil.'}) @MaxLength(100,{message:'Səhifə açarı düzgün deyil.'}) cursor?:string;
 @IsInt({message:'Limit tam rəqəm olmalıdır.'}) @Min(1,{message:'Limit ən az 1 olmalıdır.'}) @Max(50,{message:'Limit ən çox 50 ola bilər.'}) @Type(()=>Number) limit=20;
}
export class ManageBuyerRequestDto { @IsString({message:'İdarə açarı düzgün deyil.'}) @Matches(/^[a-f0-9]{64}$/,{message:'İdarə açarı düzgün deyil.'}) token!:string; }
export class CreateBuyerOfferDto {
 @IsString({message:'Mağazanı seçin.'}) @MinLength(1,{message:'Mağazanı seçin.'}) @MaxLength(100,{message:'Mağaza identifikatoru düzgün deyil.'}) storeId!:string;
 @IsOptional() @IsNumber({maxDecimalPlaces:2},{message:'Qiyməti rəqəmlə yazın (ən çox 2 onluq rəqəm).'}) @Min(0,{message:'Qiymət mənfi ola bilməz.'}) @Max(1000000000,{message:'Qiymət çox böyükdür.'}) @Type(()=>Number) price?:number;
 @IsString({message:'Təklifinizi yazın.'}) @MinLength(10,{message:'Təklif ən az 10 simvol olmalıdır.'}) @MaxLength(1200,{message:'Təklif ən çox 1200 simvol ola bilər.'}) @Transform(trim) message!:string;
}