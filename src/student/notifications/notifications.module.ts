import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { StudentAuthModule } from '../auth/student-auth.module';
import authConfig from '../../common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [NotificationsService],
  controllers: [NotificationsController],
  imports: [
    StudentAuthModule,
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
})
export class NotificationsModule {}
