import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class StudentStoreService {
  constructor(private prisma: PrismaService) {}

  async getStores(schoolId: string) {
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
        whatsapp: true,
      },
    });

    if (activeAgents.length === 0) {
      return [];
    }

    const agentMap = new Map(activeAgents.map((a) => [a.id, a]));
    const agentIds = Array.from(agentMap.keys());

    // 2. Fetch stores directly matching the agent IDs
    const stores = await this.prisma.store.findMany({
      where: {
        agentId: { in: agentIds },
      },
      orderBy: { createdAt: 'desc' },
    });

    return stores.map((store) => ({
      ...store,
      agent: agentMap.get(store.agentId) || null,
    }));
  }

  async getStoreById(id: string, schoolId: string) {
    // 1. Fetch store by ID
    const store = await this.prisma.store.findUnique({
      where: { id },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // 2. Verify agent belongs to this school and is active
    const agent = await this.prisma.agent.findFirst({
      where: {
        id: store.agentId,
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
        whatsapp: true,
      },
    });

    if (!agent) {
      throw new NotFoundException('Store not found or agent is unavailable');
    }

    return {
      ...store,
      agent,
    };
  }

  async getStoresByAgentId(agentId: string, schoolId: string) {
    // 1. Verify agent belongs to the student's school and is not suspended
    const agent = await this.prisma.agent.findFirst({
      where: {
        id: agentId,
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
        whatsapp: true,
      },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found')
    }
    
    // 2. Fetch stores directly by agentId
    const stores = await this.prisma.store.findMany({
      where: {
        agentId,
      },
      orderBy: { createdAt: 'desc' },
    });
    return stores
  }
}
