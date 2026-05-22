import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListAuditLogsQueryDto {
  @IsString()
  @IsOptional()
  actorId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  action?: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  resourceType?: string;

  @IsString()
  @IsOptional()
  resourceId?: string;

  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit = 24;

  @IsString()
  @IsOptional()
  cursor?: string;
}
