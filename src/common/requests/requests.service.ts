import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { RecipientType, NotificationType, RequestStatus } from '@prisma/client';

export interface CreateRequestDto {
  studentId: string;
  itemId: string;
  itemCategory: 'PRODUCT' | 'PROPERTY' | 'SERVICE';
  message?: string;
  itemName: string;
}

export interface RespondRequestDto {
  requestId: string;
  agentId: string;
  status: 'APPROVED' | 'REJECTED';
  responseMessage?: string;
}

@Injectable()
export class RequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async createRequest(data: CreateRequestDto) {
    // 1. Fetch the item to verify it exists and find the owner (agentId) and name
    let item = null;
    if (data.itemCategory === 'PRODUCT') {
      item = await this.prisma.product.findUnique({ where: { id: data.itemId } });
    } else if (data.itemCategory === 'PROPERTY') {
      item = await this.prisma.property.findUnique({ where: { id: data.itemId } });
    } else if (data.itemCategory === 'SERVICE') {
      item = await this.prisma.service.findUnique({ where: { id: data.itemId } });
    } else {
      throw new BadRequestException('Invalid itemCategory');
    }

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // 2. Create the Request in database
    const request = await this.prisma.request.create({
      data: {
        itemId: data.itemId,
        itemCategory: data.itemCategory,
        studentId: data.studentId,
        message: data.message,
        status: RequestStatus.PENDING,
        itemName: data.itemName
      },
    });

    // 3. Trigger Notification to STUDENT (Awaiting Response confirmation)
    await this.notificationService.createNotification({
      recipientId: data.studentId,
      recipientType: RecipientType.STUDENT,
      title: 'Request Sent (Awaiting Response)',
      message: `Your request for "${item.name}" has been sent and is awaiting a response from the agent.`,
      type: NotificationType.INFO,
      category: 'REQUEST_CREATED',
      link: `/my-requests`,
      itemId: data.itemId,
      itemCategory: data.itemCategory,
    });

    // 4. Trigger Notification to AGENT (New Request Alert)
    if (item.agentId) {
      await this.notificationService.createNotification({
        recipientId: item.agentId,
        recipientType: RecipientType.AGENT,
        title: 'New Request Received',
        message: `A student has sent a request on your listing "${item.name}".`,
        type: NotificationType.INFO,
        category: 'REQUEST_CREATED',
        link: `/requests`,
        itemId: data.itemId,
        itemCategory: data.itemCategory,
      });
    }

    return request;
  }

  async respondToRequest(data: RespondRequestDto) {
    // 1. Fetch the request
    const request = await this.prisma.request.findUnique({
      where: { id: data.requestId },
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // 2. Fetch the item to verify the agent owns it
    let item = null;
    if (request.itemCategory === 'PRODUCT') {
      item = await this.prisma.product.findUnique({ where: { id: request.itemId } });
    } else if (request.itemCategory === 'PROPERTY') {
      item = await this.prisma.property.findUnique({ where: { id: request.itemId } });
    } else if (request.itemCategory === 'SERVICE') {
      item = await this.prisma.service.findUnique({ where: { id: request.itemId } });
    }

    if (!item || item.agentId !== data.agentId) {
      throw new BadRequestException('You are not authorized to respond to this request');
    }

    // 3. Update the request status
    const updatedRequest = await this.prisma.request.update({
      where: { id: data.requestId },
      data: {
        status: data.status === 'APPROVED' ? RequestStatus.APPROVED : RequestStatus.REJECTED,
        agentResponse: data.responseMessage,
      },
    });

    // 4. Trigger Notification to STUDENT
    await this.notificationService.createNotification({
      recipientId: request.studentId,
      recipientType: RecipientType.STUDENT,
      title: `Request Status Updated: ${data.status}`,
      message: `Your request for "${item.name}" has been updated to ${data.status}. Agent response: "${data.responseMessage || 'No response message provided.'}"`,
      type: data.status === 'APPROVED' ? NotificationType.SUCCESS : NotificationType.WARNING,
      category: 'REQUEST_UPDATED',
      link: `/my-requests`,
      itemId: item.id,
      itemCategory: request.itemCategory,
    });

    return updatedRequest;
  }

  async getStudentRequests(studentId: string) {
    return this.prisma.request.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAgentRequests(agentId: string) {
    // Find all requests for products, properties, and services owned by this agent
    const products = await this.prisma.product.findMany({ where: { agentId }, select: { id: true } });
    const properties = await this.prisma.property.findMany({ where: { agentId }, select: { id: true } });
    const services = await this.prisma.service.findMany({ where: { agentId }, select: { id: true } });

    const itemIds = [
      ...products.map(p => p.id),
      ...properties.map(p => p.id),
      ...services.map(s => s.id),
    ];

    return this.prisma.request.findMany({
      where: {
        itemId: { in: itemIds },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getItemRequests(itemId: string) {
    return this.prisma.request.findMany({
      where: { itemId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
