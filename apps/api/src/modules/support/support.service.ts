import type { CreateReportDto } from './dto/create-report.dto';
import { NotFoundException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async report(dto: CreateReportDto) {
    const target = dto.kind === 'product'
      ? await this.prisma.product.findFirst({ where: { id: dto.targetId, status: 'ACTIVE', store: { status: 'ACTIVE' } }, select: { id: true, storeId: true } })
      : await this.prisma.store.findFirst({ where: { id: dto.targetId, status: 'ACTIVE' }, select: { id: true } });
    if (!target) throw new NotFoundException('Məhsul və ya mağaza artıq kataloqda yoxdur.');
    const reasons: Record<string,string> = { wrong_information: 'Yanlış məlumat', unavailable: 'Əlçatan deyil', suspicious: 'Şübhəli elan', other: 'Digər' };
    const report = await this.prisma.report.create({ data: {
      type: dto.kind === 'product' ? 'PRODUCT_REPORT' : 'STORE_REPORT',
      ...(dto.kind === 'product' ? { productId: target.id } : { storeId: target.id }),
      message: reasons[dto.reason] + '\n' + dto.message.trim(),
    }, select: { id: true, status: true, createdAt: true } });
    return { data: report };
  }
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
