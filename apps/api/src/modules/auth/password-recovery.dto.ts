import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class ForgotPasswordDto {
  @Transform(({value}) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail({}, {message:'Düzgün e-poçt ünvanı yazın.'}) @MaxLength(180,{message:'E-poçt ünvanı çox uzundur.'}) email!: string;
}
export class ResetPasswordDto extends ForgotPasswordDto {
  @Matches(/^\d{6}$/,{message:'6 rəqəmli bərpa kodunu yazın.'}) code!: string;
  @IsString({message:'Şifrəni yazın.'}) @MinLength(8,{message:'Şifrə ən az 8 simvol olmalıdır.'}) @MaxLength(128,{message:'Şifrə ən çox 128 simvol ola bilər.'}) password!: string;
}