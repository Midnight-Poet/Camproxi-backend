import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from 'src/common/notification/notification.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { Request } from 'express';

@Controller('api/agent/notifications')
@UseGuards(AgentAuthGuard)
export class AgentNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req: Request) {
    const agentId = req['agent'].id;
    return this.notificationService.getUserNotifications(agentId, 'AGENT');
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const agentId = req['agent'].id;
    await this.notificationService.markAsRead(id, agentId);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const agentId = req['agent'].id;
    await this.notificationService.markAllAsRead(agentId, 'AGENT');
    return { message: 'All notifications marked as read' };
  }
}
