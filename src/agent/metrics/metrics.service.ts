import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgentMetrics(agentId: string) {
    // Count properties, products, and services
    const totalProperties = await this.prisma.property.count({
      where: { agentId },
    });
    const totalProducts = await this.prisma.product.count({
      where: { agentId },
    });
    const totalServices = await this.prisma.service.count({
      where: { agentId },
    });
    const totalItems = totalProperties + totalProducts + totalServices;

    // Fetch the IDs of all items owned by the agent
    const [properties, products, services] = await Promise.all([
      this.prisma.property.findMany({ where: { agentId }, select: { id: true } }),
      this.prisma.product.findMany({ where: { agentId }, select: { id: true } }),
      this.prisma.service.findMany({ where: { agentId }, select: { id: true } }),
    ]);

    const itemIds = [
      ...properties.map((p) => p.id),
      ...products.map((p) => p.id),
      ...services.map((s) => s.id),
    ];

    // Count Requests related to agent's items
    const [pendingRequests, approvedRequests, rejectedRequests, totalRequests, totalReviews, ratingAggregate] =
      itemIds.length > 0
        ? await Promise.all([
            this.prisma.request.count({
              where: { itemId: { in: itemIds }, status: 'PENDING' },
            }),
            this.prisma.request.count({
              where: { itemId: { in: itemIds }, status: 'APPROVED' },
            }),
            this.prisma.request.count({
              where: { itemId: { in: itemIds }, status: 'REJECTED' },
            }),
            this.prisma.request.count({
              where: { itemId: { in: itemIds } },
            }),
            this.prisma.review.count({
              where: { itemId: { in: itemIds } },
            }),
            this.prisma.rating.aggregate({
              where: { itemId: { in: itemIds } },
              _avg: { rating: true },
            }),
          ])
        : [0, 0, 0, 0, 0, { _avg: { rating: 0 } }];

    const averageRating = ratingAggregate._avg?.rating || 0;

    return {
      success: true,
      data: {
        inventory: {
          properties: totalProperties,
          products: totalProducts,
          services: totalServices,
          total: totalItems,
        },
        requests: {
          pending: pendingRequests,
          approved: approvedRequests,
          rejected: rejectedRequests,
          total: totalRequests,
        },
        reviews: {
          total: totalReviews,
          averageRating: Number(averageRating.toFixed(2)),
        },
      },
    };
  }
}
