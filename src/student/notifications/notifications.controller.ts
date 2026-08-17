import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { PushTokenDto } from './dto/push-token.dto';
import { Request } from 'express';

@Controller('api/student/notifications')
@UseGuards(StudentAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('settings')
  async getSettings(@Req() req: Request) {
    const userId = req['user']?.sub;
    return this.notificationsService.getSettings(userId);
  }

  @Patch('settings')
  async updateSettings(
    @Req() req: Request,
    @Body() dto: UpdateSettingsDto,
  ) {
    const userId = req['user']?.sub;
    return this.notificationsService.updateSettings(userId, dto);
  }

  @Post('push-token')
  async addPushToken(
    @Req() req: Request,
    @Body() dto: PushTokenDto,
  ) {
    const userId = req['user']?.sub;
    return this.notificationsService.addPushToken(userId, dto.token);
  }

  @Delete('push-token')
  async removePushToken(
    @Req() req: Request,
    @Body() dto: PushTokenDto,
  ) {
    const userId = req['user']?.sub;
    return this.notificationsService.removePushToken(userId, dto.token);
  }
}
