import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProducts(schoolId: string) {
    return this.prisma.product.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string, schoolId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, schoolId },
    });
    if (!product) throw new NotFoundException('Product not found');
    
    const reviews = await this.prisma.review.findMany({
      where: { itemId: id, itemCategory: 'PRODUCT' },
      include: { student: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const ratings = await this.prisma.rating.findMany({
      where: { itemId: id, itemCategory: 'PRODUCT' },
      include: { student: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { ...product, reviews, ratings };
  }

  async getProperties(schoolId: string) {
    return this.prisma.property.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPropertyById(id: string, schoolId: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, schoolId },
    });
    if (!property) throw new NotFoundException('Property not found');

    const reviews = await this.prisma.review.findMany({
      where: { itemId: id, itemCategory: 'PROPERTY' },
      include: { student: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const ratings = await this.prisma.rating.findMany({
      where: { itemId: id, itemCategory: 'PROPERTY' },
      include: { student: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { ...property, reviews, ratings };
  }

  async getServices(schoolId: string) {
    return this.prisma.service.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getServiceById(id: string, schoolId: string) {
    const service = await this.prisma.service.findFirst({
      where: { id, schoolId },
    });
    if (!service) throw new NotFoundException('Service not found');

    const reviews = await this.prisma.review.findMany({
      where: { itemId: id, itemCategory: 'SERVICE' },
      include: { student: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }
    });
    const ratings = await this.prisma.rating.findMany({
      where: { itemId: id, itemCategory: 'SERVICE' },
      include: { student: { select: { id: true, firstName: true, lastName: true, profileImage: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { ...service, reviews, ratings };
  }
}
