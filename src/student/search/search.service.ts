import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    schoolId: string,
    query: {
      q?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?: string;
    },
  ) {
    const { q, category = 'ALL', minPrice, maxPrice, sortBy } = query;

    const baseWhere: any = {
      schoolId,
    };

    if (q) {
      baseWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      baseWhere.price = {};
      if (minPrice !== undefined) baseWhere.price.gte = Number(minPrice);
      if (maxPrice !== undefined) baseWhere.price.lte = Number(maxPrice);
    }

    let products = [];
    let properties = [];
    let services = [];

    if (category === 'ALL' || category === 'PRODUCT') {
      products = await this.prisma.product.findMany({ where: baseWhere });
      products = products.map((p) => ({ ...p, type: 'PRODUCT' }));
    }

    if (category === 'ALL' || category === 'PROPERTY') {
      properties = await this.prisma.property.findMany({ where: baseWhere });
      properties = properties.map((p) => ({ ...p, type: 'PROPERTY' }));
    }

    if (category === 'ALL' || category === 'SERVICE') {
      services = await this.prisma.service.findMany({ where: baseWhere });
      services = services.map((p) => ({ ...p, type: 'SERVICE' }));
    }

    let results = [...products, ...properties, ...services];

    if (sortBy) {
      results.sort((a, b) => {
        if (sortBy === 'price_asc') {
          return (a.price || 0) - (b.price || 0);
        }
        if (sortBy === 'price_desc') {
          return (b.price || 0) - (a.price || 0);
        }
        if (sortBy === 'rating_desc') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return 0;
      });
    }

    return results;
  }
}
