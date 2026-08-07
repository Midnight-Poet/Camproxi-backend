import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { paginate } from 'src/common/utils/pagination.util';
import { AdminRole, RecipientType, NotificationType, NotificationCat } from '@prisma/client';
import { NotificationService } from 'src/common/notification/notification.service';

@Injectable()
export class AdminContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  private getLocationScope(admin: any) {
    if (admin.role === AdminRole.OFFICIAL) {
      if (!admin.schoolId) {
        throw new ForbiddenException('Official admin does not have a school location assigned');
      }
      return { schoolId: admin.schoolId };
    }
    return {};
  }

  async getPendingContent(admin: any, page: number = 1, limit: number = 20) {
    const scope = this.getLocationScope(admin);
    
    const [properties, products, services] = await Promise.all([
      paginate(this.prisma.property, {
        where: { status: 'pending', agent: scope },
        include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }, page, limit),
      paginate(this.prisma.product, {
        where: { status: 'pending', agent: scope },
        include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }, page, limit),
      paginate(this.prisma.service, {
        where: { status: 'pending', agent: scope },
        include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }, page, limit),
    ]);

    return { properties, products, services };
  }

  async verifyProperty(admin: any, propertyId: string) {
    const scope = this.getLocationScope(admin);
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, agent: scope },
    });
    if (!property) throw new NotFoundException('Property not found or out of scope');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'verified' },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Property Verified',
      message: `Your property "${updated.name}" has been verified and is now live.`,
      category: NotificationCat.ITEM_VERIFIED,
      type: NotificationType.SUCCESS,
      itemId: updated.id,
      itemCategory: 'PROPERTY'
    });

    return updated;
  }

  async verifyProduct(admin: any, productId: string) {
    const scope = this.getLocationScope(admin);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, agent: scope },
    });
    if (!product) throw new NotFoundException('Product not found or out of scope');

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { status: 'verified' },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Product Verified',
      message: `Your product "${updated.name}" has been verified and is now live.`,
      category: NotificationCat.ITEM_VERIFIED,
      type: NotificationType.SUCCESS,
      itemId: updated.id,
      itemCategory: 'PRODUCT'
    });

    return updated;
  }

  async verifyService(admin: any, serviceId: string) {
    const scope = this.getLocationScope(admin);
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, agent: scope },
    });
    if (!service) throw new NotFoundException('Service not found or out of scope');

    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: { status: 'verified' },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Service Verified',
      message: `Your service "${updated.name}" has been verified and is now live.`,
      category: NotificationCat.ITEM_VERIFIED,
      type: NotificationType.SUCCESS,
      itemId: updated.id,
      itemCategory: 'SERVICE'
    });

    return updated;
  }
}
