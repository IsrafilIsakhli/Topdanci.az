import { IsEnum, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export enum StoreAssetKindDto {
  LOGO = 'logo',
  BANNER = 'banner',
}

export class CreateStoreAssetUploadUrlDto {
  @IsString()
  @MaxLength(64)
  storeId!: string;

  @IsEnum(StoreAssetKindDto)
  kind!: StoreAssetKindDto;

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

export class CompleteStoreAssetUploadDto {
  @IsEnum(StoreAssetKindDto)
  kind!: StoreAssetKindDto;

  @IsString()
  @MaxLength(500)
  storageKey!: string;

  @IsString()
  @MaxLength(80)
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(10_000_000)
  sizeBytes!: number;
}
