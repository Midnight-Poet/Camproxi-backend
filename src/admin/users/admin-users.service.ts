import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Helpers to get the scope condition for the admin
  private getLocationScope(admin: any) {
    if (admin.role === AdminRole.OFFICIAL) {
      if (!admin.schoolId) {
        throw new ForbiddenException('Official admin does not have a school location assigned');
      }
      return { schoolId: admin.schoolId };
    }
    return {}; // SUPER_ADMIN and ADMIN see everything
  }

  async getStudents(admin: any) {
    const scope = this.getLocationScope(admin);
    return this.prisma.user.findMany({
      where: scope,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        phone: true,
        isverified: true,
        isSuspended: true,
        campusName: true,
        school: { select: { id: true, name: true, code: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAgents(admin: any) {
    const scope = this.getLocationScope(admin);
    return this.prisma.agent.findMany({
      where: scope,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        companyName: true,
        email: true,
        phone: true,
        category: true,
        isverified: true,
        isSuspended: true,
        campusName: true,
        school: { select: { id: true, name: true, code: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudentDetails(admin: any, studentId: string) {
    const scope = this.getLocationScope(admin);
    const student = await this.prisma.user.findFirst({
      where: { id: studentId, ...scope },
      include: {
        school: true,
        saveditems: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found or out of scope');
    }
    return student;
  }

  async getAgentDetails(admin: any, agentId: string) {
    const scope = this.getLocationScope(admin);
    const agent = await this.prisma.agent.findFirst({
      where: { id: agentId, ...scope },
      include: {
        school: true,
        properties: true,
        products: true,
        services: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found or out of scope');
    }
    return agent;
  }

  async toggleStudentSuspension(admin: any, studentId: string, suspend: boolean) {
    const scope = this.getLocationScope(admin);
    const student = await this.prisma.user.findFirst({ where: { id: studentId, ...scope } });
    if (!student) throw new NotFoundException('Student not found or out of scope');

    return this.prisma.user.update({
      where: { id: studentId },
      data: { isSuspended: suspend },
    });
  }

  async toggleAgentSuspension(admin: any, agentId: string, suspend: boolean) {
    const scope = this.getLocationScope(admin);
    const agent = await this.prisma.agent.findFirst({ where: { id: agentId, ...scope } });
    if (!agent) throw new NotFoundException('Agent not found or out of scope');

    return this.prisma.agent.update({
      where: { id: agentId },
      data: { isSuspended: suspend },
    });
  }
}
