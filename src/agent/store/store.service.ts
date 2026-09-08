import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateOrUpdateStoreDto } from './dto/store.dto';
import { AgentCategory } from '@prisma/client';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async getStores(agentId: string) {
    return this.prisma.store.findMany({
      where: { agentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStore(agentId: string, id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, agentId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async createStore(agentId: string, data: CreateOrUpdateStoreDto, bannerImage?: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (agent.category !== AgentCategory.VENDOR) {
      throw new ForbiddenException('Only Vendors can have stores');
    }

    return this.prisma.store.create({
      data: {
        agentId,
        name: data.name,
        description: data.description,
        bannerImage: bannerImage || undefined,
        address: data.address,
        location: data.location as any,
        operatingHours: data.operatingHours as any,
      },
    });
  }

  async updateStore(agentId: string, id: string, data: CreateOrUpdateStoreDto, bannerImage?: string) {
    // Verify ownership
    await this.getStore(agentId, id);

    const updateData: any = {
      name: data.name,
      description: data.description,
      address: data.address,
      location: data.location as any,
      operatingHours: data.operatingHours as any,
    };

    if (bannerImage) {
      updateData.bannerImage = bannerImage;
    }

    return this.prisma.store.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteStore(agentId: string, id: string) {
    // Verify ownership
    await this.getStore(agentId, id);

    await this.prisma.store.delete({
      where: { id },
    });

    return { message: 'Store deleted successfully' };
  }
}
