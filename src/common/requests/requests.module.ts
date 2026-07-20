import { Module, Global } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [PrismaModule, NotificationModule],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
