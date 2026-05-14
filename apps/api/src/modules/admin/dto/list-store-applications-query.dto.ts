import { ApplicationStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListStoreApplicationsQueryDto {
  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;
}
