import { Module, Global } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationGateway } from './notification.gateway';
import { JwtModule } from '@nestjs/jwt';
import authConfig from '../auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync(authConfig.asProvider()),
    ConfigModule.forFeature(authConfig),
  ],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
