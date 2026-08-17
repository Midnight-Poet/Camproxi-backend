import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AgentReportsService } from './agent-reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';

@Controller('api/agent/reports')
@UseGuards(AgentAuthGuard)
export class AgentReportsController {
  constructor(private readonly agentReportsService: AgentReportsService) {}

  @Post()
  async createReport(@Request() req: any, @Body() body: CreateReportDto) {
    return this.agentReportsService.createReport(req.agent.id, body);
  }

  @Get()
  async getMyReports(@Request() req: any) {
    return this.agentReportsService.getMyReports(req.agent.id);
  }
}
