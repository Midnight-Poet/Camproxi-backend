import { Injectable } from '@nestjs/common';
import { PrismaService } from './common/prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHealth(): object {
    return {
      status: 'ok',
      service: 'Camproxi Unified Backend',
      timestamp: new Date().toISOString(),
    };
  }

  async getPublicSchools() {
    return this.prisma.school.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        campus: true,
      },
    });
  }
}
