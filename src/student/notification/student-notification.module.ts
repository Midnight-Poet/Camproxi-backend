import { Module } from '@nestjs/common';
import { StudentNotificationController } from './student-notification.controller';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
  controllers: [StudentNotificationController],
})
export class StudentNotificationModule {}
