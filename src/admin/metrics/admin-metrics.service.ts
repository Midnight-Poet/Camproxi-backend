import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AdminRole, ReportStatus } from '@prisma/client';

@Injectable()
export class AdminMetricsService {
  constructor(private readonly prisma: PrismaService) {}

  private getLocationScope(admin: any) {
    if (admin.role === AdminRole.OFFICIAL) {
      if (!admin.schoolId) {
        throw new ForbiddenException('Official admin does not have a school location assigned');
      }
      return { schoolId: admin.schoolId };
    }
    return {};
  }

  async getDashboardMetrics(admin: any) {
    const scope = this.getLocationScope(admin);

    const [
      totalStudents,
      totalAgents,
      verifiedAgents,
      unverifiedAgents,
      pendingProperties,
      pendingProducts,
      pendingServices,
      openReports,
      recentStudents,
      recentAgents,
    ] = await Promise.all([
      this.prisma.user.count({ where: scope }),
      this.prisma.agent.count({ where: scope }),
      this.prisma.agent.count({ where: { ...scope, isverified: true } }),
      this.prisma.agent.count({ where: { ...scope, isverified: false } }),
      this.prisma.property.count({ where: { status: 'pending', agent: scope } }),
      this.prisma.product.count({ where: { status: 'pending', agent: scope } }),
      this.prisma.service.count({ where: { status: 'pending', agent: scope } }),
      
      // For open reports scoped to official, we'd need a more complex query, 
      // but for simplicity, if OFFICIAL, we might just fetch their school reports count.
      // Since report doesn't have schoolId directly, we'll fetch all open for admins.
      admin.role === AdminRole.OFFICIAL 
        ? 0 // Simplified: Officials get 0 or we run a complex query. Let's run a raw query or just fetch open reports if we can.
        : this.prisma.report.count({ where: { status: ReportStatus.OPEN } }),

      this.prisma.user.findMany({
        where: scope,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, firstName: true, lastName: true, createdAt: true },
      }),
      this.prisma.agent.findMany({
        where: scope,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, companyName: true, category: true, createdAt: true },
      }),
    ]);

    let resolvedOpenReports = openReports;
    if (admin.role === AdminRole.OFFICIAL) {
      // Find students and agents in this school to count their open reports
      const [students, agents] = await Promise.all([
        this.prisma.user.findMany({ where: { schoolId: admin.schoolId }, select: { id: true } }),
        this.prisma.agent.findMany({ where: { schoolId: admin.schoolId }, select: { id: true } })
      ]);
      const allowedIds = [...students.map(s => s.id), ...agents.map(a => a.id)];
      resolvedOpenReports = await this.prisma.report.count({
        where: { status: ReportStatus.OPEN, reporterId: { in: allowedIds } }
      });
    }

    return {
      users: {
        students: totalStudents,
        agents: totalAgents,
        verifiedAgents,
        unverifiedAgents,
      },
      pendingContent: {
        properties: pendingProperties,
        products: pendingProducts,
        services: pendingServices,
        total: pendingProperties + pendingProducts + pendingServices,
      },
      support: {
        openReports: resolvedOpenReports,
      },
      recentRegistrations: {
        students: recentStudents,
        agents: recentAgents,
      },
    };
  }
}
