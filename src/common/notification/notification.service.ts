import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecipientType, NotificationType, NotificationCat } from '@prisma/client';

export interface CreateNotificationDto {
  recipientId: string;
  recipientType: RecipientType;
  title: string;
  message: string;
  type?: NotificationType;
  category: NotificationCat;
  link?: string;
  itemId?: string;
  itemCategory?: string;
}

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        recipientType: data.recipientType,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        category: data.category,
        link: data.link,
        itemId: data.itemId,
        itemCategory: data.itemCategory,
      },
    });
  }

  async getUserNotifications(recipientId: string, recipientType: RecipientType) {
    return this.prisma.notification.findMany({
      where: {
        recipientId,
        recipientType,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async markAsRead(notificationId: string, recipientId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId,
      },
      data: {
        isRead: true,
      },
    });
  }

  async markAllAsRead(recipientId: string, recipientType: RecipientType) {
    return this.prisma.notification.updateMany({
      where: {
        recipientId,
        recipientType,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }
}
