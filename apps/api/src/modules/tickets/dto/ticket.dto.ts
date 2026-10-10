import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { TicketPriority, TicketReason, TicketStatus } from '@prisma/client';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateTicketDto {
  @IsString() @MinLength(1) @MaxLength(100) storeId!: string;
  @Transform(trim) @IsString() @MinLength(5) @MaxLength(200) subject!: string;
  @IsEnum(TicketReason) reason!: TicketReason;
  @IsEnum(TicketPriority) priority: TicketPriority = TicketPriority.NORMAL;
  @Transform(trim) @IsString() @MinLength(10) @MaxLength(5000) message!: string;
}

export class ListTicketsDto {
  @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
  @IsOptional() @IsEnum(TicketReason) reason?: TicketReason;
  @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @IsOptional() @Transform(trim) @IsString() @MaxLength(200) q?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(10000) page = 1;
  @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize = 20;
}

export class TicketMessageDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(5000) message!: string;
  @IsInt() @Min(1) @Max(2147483647) version!: number;
}

export class UpdateTicketDto {
  @IsOptional() @IsEnum(TicketStatus) status?: TicketStatus;
  @IsOptional() @IsEnum(TicketPriority) priority?: TicketPriority;
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(({ obj, key }: { obj: Record<string, unknown>; key: string }) => obj[key])
  @IsBoolean()
  claim?: boolean;
  @IsOptional() @Transform(trim) @IsString() @MinLength(5) @MaxLength(5000) message?: string;
  @IsInt() @Min(1) @Max(2147483647) version!: number;
}

export class TicketMessagesQueryDto {
  @IsOptional() @IsString() @MaxLength(100) cursor?: string;
  @Type(() => Number) @IsInt() @Min(1) @Max(50) limit = 50;
}
