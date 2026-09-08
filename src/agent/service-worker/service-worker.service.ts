import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateServiceWorkerDto, UpdateServiceWorkerDto } from './dto/service-worker.dto';
import { AgentCategory } from '@prisma/client';

@Injectable()
export class ServiceWorkerService {
  constructor(private prisma: PrismaService) {}

  async getWorkers(agentId: string) {
    return this.prisma.serviceWorker.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorker(agentId: string, id: string) {
    const worker = await this.prisma.serviceWorker.findUnique({
      where: { id },
    });

    if (!worker || worker.agentId !== agentId) {
      throw new NotFoundException('Service worker not found');
    }

    return worker;
  }

  async createWorker(agentId: string, data: CreateServiceWorkerDto, profileImage?: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.category !== AgentCategory.SERVICE_PROVIDER) {
      throw new ForbiddenException('Only Service Providers can add service workers');
    }

    return this.prisma.serviceWorker.create({
      data: {
        agentId,
        name: data.name,
        kindOfService: data.kindOfService,
        profileImage: profileImage || undefined,
        phone: data.phone,
        whatsapp: data.whatsapp,
        socialLinks: data.socialLinks as any,
      },
    });
  }

  async updateWorker(agentId: string, id: string, data: UpdateServiceWorkerDto, profileImage?: string) {
    // Verify ownership
    await this.getWorker(agentId, id);

    const updateData: any = {
      name: data.name,
      kindOfService: data.kindOfService,
      phone: data.phone,
      whatsapp: data.whatsapp,
      socialLinks: data.socialLinks as any,
    };

    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    return this.prisma.serviceWorker.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteWorker(agentId: string, id: string) {
    // Verify ownership
    await this.getWorker(agentId, id);

    await this.prisma.serviceWorker.delete({
      where: { id },
    });

    return { message: 'Service worker deleted successfully' };
  }
}
