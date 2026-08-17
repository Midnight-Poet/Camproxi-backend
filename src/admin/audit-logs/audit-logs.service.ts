import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async logAction(adminId: string, action: string, details?: string) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        details,
      },
    });
  }

  async getLogs(admin: any) {
    const whereClause: any = {};
    if (admin.role === AdminRole.ADMIN) {
      whereClause.admin = {
        role: {
          not: AdminRole.SUPER_ADMIN,
        },
      };
    }

    return this.prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            role: true,
          },
        },
      },
    });
  }
}
