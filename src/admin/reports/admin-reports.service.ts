import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AdminRole, ReportStatus } from '@prisma/client';

@Injectable()
export class AdminReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReports(admin: any) {
    let whereClause = {};

    // For OFFICIAL, we might only want to show reports from users in their school
    // But reporter could be STUDENT or AGENT. This is complex to filter directly on Report.
    // So we fetch reports and optionally filter them, or just fetch all for now
    // If you want strict scoping for officials, we need to join user/agent.
    if (admin.role === AdminRole.OFFICIAL) {
      if (!admin.schoolId) throw new ForbiddenException('No school assigned');
      
      // Fetch students and agents in this school
      const [students, agents] = await Promise.all([
        this.prisma.user.findMany({ where: { schoolId: admin.schoolId }, select: { id: true } }),
        this.prisma.agent.findMany({ where: { schoolId: admin.schoolId }, select: { id: true } })
      ]);
      
      const allowedIds = [...students.map(s => s.id), ...agents.map(a => a.id)];
      whereClause = { reporterId: { in: allowedIds } };
    }

    return this.prisma.report.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async replyToReport(admin: any, reportId: string, reply: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');

    if (admin.role === AdminRole.OFFICIAL) {
      // Check if official is allowed to reply to this user
      const isStudent = await this.prisma.user.findFirst({ where: { id: report.reporterId, schoolId: admin.schoolId } });
      const isAgent = await this.prisma.agent.findFirst({ where: { id: report.reporterId, schoolId: admin.schoolId } });
      if (!isStudent && !isAgent) {
        throw new ForbiddenException('You cannot reply to a report outside your jurisdiction');
      }
    }

    // Update report
    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        reply,
        repliedById: admin.sub,
        status: ReportStatus.RESOLVED,
      },
    });

    // TODO: Send notification to the user/agent that their report was replied to

    return updated;
  }
}
