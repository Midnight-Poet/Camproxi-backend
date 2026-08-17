import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { RecipientType, ReportTargetType } from '@prisma/client';

@Injectable()
export class StudentReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(studentId: string, data: CreateReportDto) {
    if (data.targetType === ReportTargetType.AGENT) {
      if (!data.targetId) throw new BadRequestException('targetId is required when reporting an agent');
      const agent = await this.prisma.agent.findUnique({ where: { id: data.targetId } });
      if (!agent) throw new BadRequestException('Agent not found');
    }

    if (data.targetType === ReportTargetType.ITEM) {
      if (!data.targetId) throw new BadRequestException('targetId is required when reporting an item');
      if (!data.itemCategory) throw new BadRequestException('itemCategory is required when reporting an item');
      
      let item = null;
      if (data.itemCategory === 'PRODUCT') {
        item = await this.prisma.product.findUnique({ where: { id: data.targetId } });
      } else if (data.itemCategory === 'PROPERTY') {
        item = await this.prisma.property.findUnique({ where: { id: data.targetId } });
      } else if (data.itemCategory === 'SERVICE') {
        item = await this.prisma.service.findUnique({ where: { id: data.targetId } });
      } else {
        throw new BadRequestException('Invalid itemCategory');
      }

      if (!item) throw new BadRequestException('Item not found');
    }

    return this.prisma.report.create({
      data: {
        subject: data.subject,
        message: data.message,
        reporterId: studentId,
        reporterType: RecipientType.STUDENT,
        targetType: data.targetType,
        targetId: data.targetId,
        itemCategory: data.itemCategory,
      },
    });
  }

  async getMyReports(studentId: string) {
    return this.prisma.report.findMany({
      where: {
        reporterId: studentId,
        reporterType: RecipientType.STUDENT,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
