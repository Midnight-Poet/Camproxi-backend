import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import authConfig from '../auth/config/auth.config';

import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    JwtModule.register({
      secret: authConfig().secret,
    }),
    NotificationModule,
  ],
  providers: [ChatGateway, ChatService],
  exports: [ChatService],
})
export class ChatModule {}
