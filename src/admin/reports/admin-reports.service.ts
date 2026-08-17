import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { NotificationService } from 'src/common/notification/notification.service';
import { AdminRole, ReportStatus, NotificationType, RecipientType } from '@prisma/client';

// NOTE: REPORT_REPLIED will be available after running `npx prisma generate`
// once the dev server is stopped to release the DLL lock.
const REPORT_REPLIED_CAT = 'REPORT_REPLIED' as any;

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  // Helper to get the scoped reporter IDs for an OFFICIAL admin
  private async getScopedReporterIds(schoolId: string): Promise<string[]> {
    const [students, agents] = await Promise.all([
      this.prisma.user.findMany({ where: { schoolId }, select: { id: true } }),
      this.prisma.agent.findMany({ where: { schoolId }, select: { id: true } }),
    ]);
    return [...students.map((s) => s.id), ...agents.map((a) => a.id)];
  }

  // Helper to check if an official admin can access a specific report
  private async assertOfficialScope(admin: any, reporterId: string) {
    if (admin.role !== AdminRole.OFFICIAL) return;
    if (!admin.schoolId) throw new ForbiddenException('No school assigned to this admin');
    const allowed = await this.getScopedReporterIds(admin.schoolId);
    if (!allowed.includes(reporterId)) {
      throw new ForbiddenException('You cannot access a report outside your jurisdiction');
    }
  }

  // Helper to populate reporter and target details on a report
  private async populateReport(r: any) {
    let reporter = null;
    if (r.reporterType === 'STUDENT') {
      reporter = await this.prisma.user.findUnique({
        where: { id: r.reporterId },
        select: { firstName: true, lastName: true, email: true },
      });
    } else if (r.reporterType === 'AGENT') {
      reporter = await this.prisma.agent.findUnique({
        where: { id: r.reporterId },
        select: { firstName: true, lastName: true, email: true, companyName: true },
      });
    }

    let target = null;
    if (r.targetId) {
      if (r.targetType === 'STUDENT') {
        target = await this.prisma.user.findUnique({ where: { id: r.targetId }, select: { firstName: true, lastName: true, email: true } });
      } else if (r.targetType === 'AGENT') {
        target = await this.prisma.agent.findUnique({ where: { id: r.targetId }, select: { firstName: true, lastName: true, email: true, companyName: true } });
      } else if (r.targetType === 'ITEM' && r.itemCategory) {
        if (r.itemCategory === 'PRODUCT') {
          target = await this.prisma.product.findUnique({ where: { id: r.targetId }, select: { name: true, businessCategory: true } });
        } else if (r.itemCategory === 'PROPERTY') {
          target = await this.prisma.property.findUnique({ where: { id: r.targetId }, select: { name: true, roomType: true } });
        } else if (r.itemCategory === 'SERVICE') {
          target = await this.prisma.service.findUnique({ where: { id: r.targetId }, select: { name: true, serviceCategory: true } });
        }
      }
    }

    return { ...r, reporter, target };
  }

  // ─── GET REPORTS (paginated, filtered) ────────────────────────────────────
  async getReports(
    admin: any,
    page = 1,
    limit = 20,
    status?: ReportStatus,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;

    let whereClause: any = {};

    // Scope OFFICIAL to their school's reporters
    if (admin.role === AdminRole.OFFICIAL) {
      if (!admin.schoolId) throw new ForbiddenException('No school assigned');
      const allowedIds = await this.getScopedReporterIds(admin.schoolId);
      whereClause.reporterId = { in: allowedIds };
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const [total, reports] = await Promise.all([
      this.prisma.report.count({ where: whereClause }),
      this.prisma.report.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const populated = await Promise.all(reports.map((r) => this.populateReport(r)));

    return {
      data: populated,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // ─── GET SINGLE REPORT ────────────────────────────────────────────────────
  async getReportById(admin: any, reportId: string) {
    const r = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!r) throw new NotFoundException('Report not found');
    await this.assertOfficialScope(admin, r.reporterId);
    return this.populateReport(r);
  }

  // ─── REPLY TO REPORT ─────────────────────────────────────────────────────
  async replyToReport(admin: any, reportId: string, reply: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    await this.assertOfficialScope(admin, report.reporterId);

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { reply, repliedById: admin.sub, status: ReportStatus.RESOLVED },
    });

    // Notify the reporter
    await this.notificationService.createNotification({
      recipientId: report.reporterId,
      recipientType: report.reporterType as RecipientType,
      title: 'Your Report Has Been Replied To',
      message: `An admin has replied to your report: "${report.subject}". Reply: ${reply}`,
      category: REPORT_REPLIED_CAT,
      type: NotificationType.INFO,
    });

    return updated;
  }

  // ─── RESOLVE WITHOUT REPLY ────────────────────────────────────────────────
  async resolveReport(admin: any, reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    await this.assertOfficialScope(admin, report.reporterId);

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.RESOLVED },
    });

    await this.notificationService.createNotification({
      recipientId: report.reporterId,
      recipientType: report.reporterType as RecipientType,
      title: 'Your Report Has Been Resolved',
      message: `Your report "${report.subject}" has been marked as resolved.`,
      category: REPORT_REPLIED_CAT,
      type: NotificationType.INFO,
    });

    return updated;
  }

  // ─── REOPEN A RESOLVED REPORT ─────────────────────────────────────────────
  async reopenReport(admin: any, reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    await this.assertOfficialScope(admin, report.reporterId);

    if (report.status === ReportStatus.OPEN) {
      throw new BadRequestException('Report is already open');
    }

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { status: ReportStatus.OPEN },
    });

    await this.notificationService.createNotification({
      recipientId: report.reporterId,
      recipientType: report.reporterType as RecipientType,
      title: 'Your Report Has Been Reopened',
      message: `Your report "${report.subject}" has been reopened for further review.`,
      category: REPORT_REPLIED_CAT,
      type: NotificationType.INFO,
    });

    return updated;
  }

  // ─── DELETE A REPORT ──────────────────────────────────────────────────────
  async deleteReport(admin: any, reportId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    await this.assertOfficialScope(admin, report.reporterId);

    await this.prisma.report.delete({ where: { id: reportId } });
    return { message: 'Report deleted successfully' };
  }

  // ─── ASSIGN REPORT TO AN ADMIN ────────────────────────────────────────────
  async assignReport(admin: any, reportId: string, assignToAdminId: string) {
    const report = await this.prisma.report.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Report not found');
    await this.assertOfficialScope(admin, report.reporterId);

    // Verify the target admin exists
    const targetAdmin = await this.prisma.admin.findUnique({ where: { id: assignToAdminId } });
    if (!targetAdmin) throw new NotFoundException('Admin to assign not found');

    const updated = await this.prisma.report.update({
      where: { id: reportId },
      data: { assignedToId: assignToAdminId },
    });

    return updated;
  }
}
