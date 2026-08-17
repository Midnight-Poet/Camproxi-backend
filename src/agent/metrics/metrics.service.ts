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
    const requests = await this.prisma.request.findMany({
      where: { itemId: { in: itemIds } },
      select: { status: true },
    });

    const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;
    const approvedRequests = requests.filter((r) => r.status === 'APPROVED').length;
    const rejectedRequests = requests.filter((r) => r.status === 'REJECTED').length;

    // Calculate Reviews and Average Rating
    const reviews = await this.prisma.review.findMany({
      where: { itemId: { in: itemIds } },
      select: { id: true },
    });
    const totalReviews = reviews.length;

    const ratings = await this.prisma.rating.findMany({
      where: { itemId: { in: itemIds } },
      select: { rating: true },
    });
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

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
          total: requests.length,
        },
        reviews: {
          total: totalReviews,
          averageRating: Number(averageRating.toFixed(2)),
        },
      },
    };
  }
}
