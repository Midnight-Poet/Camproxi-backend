import { Module } from '@nestjs/common';
import { AgentReportsController } from './agent-reports.controller';
import { AgentReportsService } from './agent-reports.service';
import { AgentAuthModule } from '../auth/agent-auth.module';

@Module({
  imports: [AgentAuthModule],
  controllers: [AgentReportsController],
  providers: [AgentReportsService],
})
export class AgentReportsModule {}
