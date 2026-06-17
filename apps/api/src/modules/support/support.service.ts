import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(dto: CreateSupportRequestDto) {
    const report = await this.prisma.report.create({
      data: {
        type: 'SUPPORT_REQUEST',
        message: buildSupportMessage(dto),
      },
      select: {
        id: true,
        status: true,
        type: true,
        createdAt: true,
      },
    });

    return { data: report };
  }
}

function buildSupportMessage(dto: CreateSupportRequestDto): string {
  const parts = [
    `Ad: ${dto.name}`,
    `E-poçt: ${dto.email}`,
    dto.phone ? `Telefon: ${dto.phone}` : null,
    dto.subject ? `Mövzu: ${dto.subject}` : null,
    '',
    dto.message,
  ].filter((part): part is string => part !== null);

  return parts.join('\n');
}
