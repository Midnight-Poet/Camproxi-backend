import { Module } from '@nestjs/common';
import { AgentRequestsController } from './agent-requests.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';

@Module({
  imports: [AgentAuthModule],
  controllers: [AgentRequestsController],
})
export class AgentRequestsModule {}
