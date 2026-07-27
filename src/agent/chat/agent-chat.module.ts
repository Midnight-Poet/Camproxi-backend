import { Module } from '@nestjs/common';
import { AgentChatController } from './agent-chat.controller';
import { ChatModule } from '../../common/chat/chat.module';
import { AgentAuthModule } from '../auth/agent-auth.module';

@Module({
  imports: [ChatModule, AgentAuthModule],
  controllers: [AgentChatController],
})
export class AgentChatModule {}
