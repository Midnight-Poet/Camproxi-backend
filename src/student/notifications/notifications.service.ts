import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Return default settings if none exist
    return (
      user.notificationSettings || {
        pushEnabled: true,
        emailEnabled: true,
        orders: true,
        promotions: true,
        security: true,
      }
    );
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentSettings = user.notificationSettings || {
      pushEnabled: true,
      emailEnabled: true,
      orders: true,
      promotions: true,
      security: true,
    };

    const newSettings = { ...currentSettings, ...dto };

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        notificationSettings: newSettings,
      },
    });

    return newSettings;
  }

  async addPushToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pushTokens = user.pushTokens || [];
    if (!pushTokens.includes(token)) {
      pushTokens.push(token);
      await this.prisma.user.update({
        where: { id: userId },
        data: { pushTokens },
      });
    }

    return { message: 'Push token registered successfully' };
  }

  async removePushToken(userId: string, token: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { pushTokens: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pushTokens = user.pushTokens || [];
    const updatedTokens = pushTokens.filter((t) => t !== token);

    await this.prisma.user.update({
      where: { id: userId },
      data: { pushTokens: updatedTokens },
    });

    return { message: 'Push token removed successfully' };
  }
}
