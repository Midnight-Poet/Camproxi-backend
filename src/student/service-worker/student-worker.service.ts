import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class StudentWorkerService {
  constructor(private prisma: PrismaService) {}

  async getWorkers(schoolId: string) {
    // 1. Fetch active agents for this school
    const activeAgents = await this.prisma.agent.findMany({
      where: {
        schoolId,
        isSuspended: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        phone: true,
      },
    });

    if (activeAgents.length === 0) {
      return [];
    }

    const agentMap = new Map(activeAgents.map((a) => [a.id, a]));
    const agentIds = Array.from(agentMap.keys());

    // 2. Fetch service workers directly matching the agent IDs
    const workers = await this.prisma.serviceWorker.findMany({
      where: {
        agentId: { in: agentIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    return workers.map((worker) => ({
      ...worker,
      agent: agentMap.get(worker.agentId) || null,
    }));
  }

  async getWorkerById(id: string, schoolId: string) {
    // 1. Fetch worker by ID
    const worker = await this.prisma.serviceWorker.findUnique({
      where: { id },
    });

    if (!worker) {
      throw new NotFoundException('Service worker not found');
    }

    // 2. Verify agent belongs to this school and is active
    const agent = await this.prisma.agent.findFirst({
      where: {
        id: worker.agentId,
        schoolId,
        isSuspended: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        phone: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Service worker not found or agent is unavailable');
    }

    return {
      ...worker,
      agent,
    };
  }

  async getWorkersByAgentId(agentId: string, schoolId: string) {
    // 1. Verify agent belongs to the student's school and is active
    const agent = await this.prisma.agent.findFirst({
      where: {
        id: agentId,
        schoolId,
        // isSuspended: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        email: true,
        phone: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found or unavailable in your campus');
    }

    // 2. Fetch workers directly by agentId
    const workers = await this.prisma.serviceWorker.findMany({
      where: {
        agentId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return workers.map((worker) => ({
      ...worker,
      agent,
    }));
  }
}
