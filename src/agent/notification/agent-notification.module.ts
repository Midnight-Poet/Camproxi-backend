import { Module } from '@nestjs/common';
import { AgentNotificationController } from './agent-notification.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';

@Module({
  imports: [AgentAuthModule],
  controllers: [AgentNotificationController],
})
export class AgentNotificationModule {}
