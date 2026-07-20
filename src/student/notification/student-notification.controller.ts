import { Controller, Get, Patch, Param, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from 'src/common/notification/notification.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { Request } from 'express';

@Controller('api/student/notifications')
@UseGuards(StudentAuthGuard)
export class StudentNotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(@Req() req: Request) {
    const studentId = req['user'].sub;
    return this.notificationService.getUserNotifications(studentId, 'STUDENT');
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const studentId = req['user'].sub;
    await this.notificationService.markAsRead(id, studentId);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const studentId = req['user'].sub;
    await this.notificationService.markAllAsRead(studentId, 'STUDENT');
    return { message: 'All notifications marked as read' };
  }
}
