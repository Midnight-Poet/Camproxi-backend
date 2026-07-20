import { Module } from '@nestjs/common';
import { AgentAuthService } from './agent-auth.service';
import { AgentAuthGuard } from './agent-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  providers: [AgentAuthService, AgentAuthGuard, RolesGuard],
  exports: [AgentAuthService, AgentAuthGuard, RolesGuard],
})
export class AgentAuthModule {}
