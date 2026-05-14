import { IsString, MaxLength, MinLength } from 'class-validator';

export class SetupPasswordDto {
  @IsString()
  @MinLength(24)
  token!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
