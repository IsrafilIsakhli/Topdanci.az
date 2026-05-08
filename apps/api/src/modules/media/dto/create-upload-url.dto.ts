import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  @MaxLength(180)
  fileName!: string;

  @IsString()
  @MaxLength(80)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(10_000_000)
  sizeBytes!: number;
}
