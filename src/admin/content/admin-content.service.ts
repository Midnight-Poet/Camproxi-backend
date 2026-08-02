import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AdminRole } from '@prisma/client';

@Injectable()
export class AdminContentService {
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

  async getPendingContent(admin: any) {
    const scope = this.getLocationScope(admin);
    
    // We need to fetch properties, products, and services that have status 'pending'
    // For properties:
    const properties = await this.prisma.property.findMany({
      where: { status: 'pending', agent: scope },
      include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const products = await this.prisma.product.findMany({
      where: { status: 'pending', agent: scope },
      include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const services = await this.prisma.service.findMany({
      where: { status: 'pending', agent: scope },
      include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { properties, products, services };
  }

  async verifyProperty(admin: any, propertyId: string) {
    const scope = this.getLocationScope(admin);
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, agent: scope },
    });
    if (!property) throw new NotFoundException('Property not found or out of scope');

    return this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'verified' },
    });
  }

  async verifyProduct(admin: any, productId: string) {
    const scope = this.getLocationScope(admin);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, agent: scope },
    });
    if (!product) throw new NotFoundException('Product not found or out of scope');

    return this.prisma.product.update({
      where: { id: productId },
      data: { status: 'verified' },
    });
  }

  async verifyService(admin: any, serviceId: string) {
    const scope = this.getLocationScope(admin);
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, agent: scope },
    });
    if (!service) throw new NotFoundException('Service not found or out of scope');

    return this.prisma.service.update({
      where: { id: serviceId },
      data: { status: 'verified' },
    });
  }
}
