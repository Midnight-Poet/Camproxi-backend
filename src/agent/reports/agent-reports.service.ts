import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { RecipientType, ReportTargetType } from '@prisma/client';

@Injectable()
export class AgentReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(agentId: string, data: CreateReportDto) {
    if (data.targetType === ReportTargetType.STUDENT) {
      if (!data.targetId) throw new BadRequestException('targetId is required when reporting a student');
      const student = await this.prisma.user.findUnique({ where: { id: data.targetId } });
      if (!student) throw new BadRequestException('Student not found');
    } else if (data.targetType !== ReportTargetType.GENERAL) {
      throw new BadRequestException('Agents can only report students or submit general reports');
    }

    return this.prisma.report.create({
      data: {
        subject: data.subject,
        message: data.message,
        reporterId: agentId,
        reporterType: RecipientType.AGENT,
        targetType: data.targetType,
        targetId: data.targetId,
      },
    });
  }

  async getMyReports(agentId: string) {
    return this.prisma.report.findMany({
      where: {
        reporterId: agentId,
        reporterType: RecipientType.AGENT,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
