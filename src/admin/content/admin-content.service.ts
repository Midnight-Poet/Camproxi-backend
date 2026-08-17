import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { paginate, PaginatedResult } from 'src/common/utils/pagination.util';
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

  async rejectProperty(admin: any, propertyId: string, reason: string) {
    const scope = this.getLocationScope(admin);
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId, agent: scope },
    });
    if (!property) throw new NotFoundException('Property not found or out of scope');

    const updated = await this.prisma.property.update({
      where: { id: propertyId },
      data: { status: 'rejected', rejectReason: reason },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Property Rejected',
      message: `Your property "${updated.name}" has been rejected. Reason: ${reason}`,
      category: NotificationCat.ITEM_REJECTED,
      type: NotificationType.ERROR,
      itemId: updated.id,
      itemCategory: 'PROPERTY'
    });

    return updated;
  }

  async rejectProduct(admin: any, productId: string, reason: string) {
    const scope = this.getLocationScope(admin);
    const product = await this.prisma.product.findFirst({
      where: { id: productId, agent: scope },
    });
    if (!product) throw new NotFoundException('Product not found or out of scope');

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data: { status: 'rejected', rejectReason: reason },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Product Rejected',
      message: `Your product "${updated.name}" has been rejected. Reason: ${reason}`,
      category: NotificationCat.ITEM_REJECTED,
      type: NotificationType.ERROR,
      itemId: updated.id,
      itemCategory: 'PRODUCT'
    });

    return updated;
  }

  async rejectService(admin: any, serviceId: string, reason: string) {
    const scope = this.getLocationScope(admin);
    const service = await this.prisma.service.findFirst({
      where: { id: serviceId, agent: scope },
    });
    if (!service) throw new NotFoundException('Service not found or out of scope');

    const updated = await this.prisma.service.update({
      where: { id: serviceId },
      data: { status: 'rejected', rejectReason: reason },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Service Rejected',
      message: `Your service "${updated.name}" has been rejected. Reason: ${reason}`,
      category: NotificationCat.ITEM_REJECTED,
      type: NotificationType.ERROR,
      itemId: updated.id,
      itemCategory: 'SERVICE'
    });

    return updated;
  }

  async getAllContent(
    admin: any,
    page: number = 1,
    limit: number = 20,
    status?: string,
    category?: string,
  ) {
    const scope = this.getLocationScope(admin);
    const filterStatus = status && status !== 'all' ? status : undefined;
    const filterCategory = category && category !== 'ALL' ? category : 'ALL';

    const whereClause: any = {};
    if (filterStatus) {
      whereClause.status = filterStatus;
    }
    if (scope.schoolId) {
      whereClause.agent = scope;
    }

    let properties: PaginatedResult<any> = { data: [], meta: { total: 0, page, lastPage: 0 } };
    let products: PaginatedResult<any> = { data: [], meta: { total: 0, page, lastPage: 0 } };
    let services: PaginatedResult<any> = { data: [], meta: { total: 0, page, lastPage: 0 } };

    const promises = [];

    if (filterCategory === 'ALL' || filterCategory === 'PROPERTY') {
      promises.push(
        paginate(this.prisma.property, {
          where: whereClause,
          include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
          orderBy: { createdAt: 'desc' },
        }, page, limit).then(res => properties = res)
      );
    }

    if (filterCategory === 'ALL' || filterCategory === 'PRODUCT') {
      promises.push(
        paginate(this.prisma.product, {
          where: whereClause,
          include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
          orderBy: { createdAt: 'desc' },
        }, page, limit).then(res => products = res)
      );
    }

    if (filterCategory === 'ALL' || filterCategory === 'SERVICE') {
      promises.push(
        paginate(this.prisma.service, {
          where: whereClause,
          include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
          orderBy: { createdAt: 'desc' },
        }, page, limit).then(res => services = res)
      );
    }

    await Promise.all(promises);

    return { properties, products, services };
  }

  // --- GET SINGLE ITEM DETAILS ---
  async getPropertyDetail(admin: any, id: string) {
    const scope = this.getLocationScope(admin);
    const property = await this.prisma.property.findFirst({
      where: { id, agent: scope },
      include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
    });
    if (!property) throw new NotFoundException('Property not found or out of scope');
    return property;
  }

  async getProductDetail(admin: any, id: string) {
    const scope = this.getLocationScope(admin);
    const product = await this.prisma.product.findFirst({
      where: { id, agent: scope },
      include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
    });
    if (!product) throw new NotFoundException('Product not found or out of scope');
    return product;
  }

  async getServiceDetail(admin: any, id: string) {
    const scope = this.getLocationScope(admin);
    const service = await this.prisma.service.findFirst({
      where: { id, agent: scope },
      include: { agent: { select: { id: true, firstName: true, lastName: true, companyName: true, phone: true } } },
    });
    if (!service) throw new NotFoundException('Service not found or out of scope');
    return service;
  }

  // --- RESET TO PENDING ---
  async resetProperty(admin: any, id: string) {
    const scope = this.getLocationScope(admin);
    const property = await this.prisma.property.findFirst({
      where: { id, agent: scope },
    });
    if (!property) throw new NotFoundException('Property not found or out of scope');

    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: 'pending', rejectReason: null },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Property Under Re-review',
      message: `Your property "${updated.name}" is being re-reviewed and its status has been reset to pending.`,
      category: NotificationCat.REQUEST_UPDATED,
      type: NotificationType.INFO,
      itemId: updated.id,
      itemCategory: 'PROPERTY'
    });

    return updated;
  }

  async resetProduct(admin: any, id: string) {
    const scope = this.getLocationScope(admin);
    const product = await this.prisma.product.findFirst({
      where: { id, agent: scope },
    });
    if (!product) throw new NotFoundException('Product not found or out of scope');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: 'pending', rejectReason: null },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Product Under Re-review',
      message: `Your product "${updated.name}" is being re-reviewed and its status has been reset to pending.`,
      category: NotificationCat.REQUEST_UPDATED,
      type: NotificationType.INFO,
      itemId: updated.id,
      itemCategory: 'PRODUCT'
    });

    return updated;
  }

  async resetService(admin: any, id: string) {
    const scope = this.getLocationScope(admin);
    const service = await this.prisma.service.findFirst({
      where: { id, agent: scope },
    });
    if (!service) throw new NotFoundException('Service not found or out of scope');

    const updated = await this.prisma.service.update({
      where: { id },
      data: { status: 'pending', rejectReason: null },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Service Under Re-review',
      message: `Your service "${updated.name}" is being re-reviewed and its status has been reset to pending.`,
      category: NotificationCat.REQUEST_UPDATED,
      type: NotificationType.INFO,
      itemId: updated.id,
      itemCategory: 'SERVICE'
    });

    return updated;
  }

  // --- TAKEDOWN VERIFIED ITEMS ---
  async takedownProperty(admin: any, id: string, reason: string) {
    const scope = this.getLocationScope(admin);
    const property = await this.prisma.property.findFirst({
      where: { id, agent: scope },
    });
    if (!property) throw new NotFoundException('Property not found or out of scope');

    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: 'rejected', rejectReason: `Taken down: ${reason}` },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Property Taken Down',
      message: `Your property "${updated.name}" has been taken down. Reason: ${reason}`,
      category: NotificationCat.ITEM_REJECTED,
      type: NotificationType.ERROR,
      itemId: updated.id,
      itemCategory: 'PROPERTY'
    });

    return updated;
  }

  async takedownProduct(admin: any, id: string, reason: string) {
    const scope = this.getLocationScope(admin);
    const product = await this.prisma.product.findFirst({
      where: { id, agent: scope },
    });
    if (!product) throw new NotFoundException('Product not found or out of scope');

    const updated = await this.prisma.product.update({
      where: { id },
      data: { status: 'rejected', rejectReason: `Taken down: ${reason}` },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Product Taken Down',
      message: `Your product "${updated.name}" has been taken down. Reason: ${reason}`,
      category: NotificationCat.ITEM_REJECTED,
      type: NotificationType.ERROR,
      itemId: updated.id,
      itemCategory: 'PRODUCT'
    });

    return updated;
  }

  async takedownService(admin: any, id: string, reason: string) {
    const scope = this.getLocationScope(admin);
    const service = await this.prisma.service.findFirst({
      where: { id, agent: scope },
    });
    if (!service) throw new NotFoundException('Service not found or out of scope');

    const updated = await this.prisma.service.update({
      where: { id },
      data: { status: 'rejected', rejectReason: `Taken down: ${reason}` },
    });

    await this.notificationService.createNotification({
      recipientId: updated.agentId,
      recipientType: RecipientType.AGENT,
      title: 'Service Taken Down',
      message: `Your service "${updated.name}" has been taken down. Reason: ${reason}`,
      category: NotificationCat.ITEM_REJECTED,
      type: NotificationType.ERROR,
      itemId: updated.id,
      itemCategory: 'SERVICE'
    });

    return updated;
  }
}
