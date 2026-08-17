import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';

@Controller('api/agent/metrics')
@UseGuards(AgentAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Req() req: any) {
    const agentId = req['agent'].id;
    return this.metricsService.getAgentMetrics(agentId);
  }
}
