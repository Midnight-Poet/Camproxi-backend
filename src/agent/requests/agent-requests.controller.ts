import { Controller, Patch, Get, Param, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { RequestsService } from 'src/common/requests/requests.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { Request } from 'express';

interface RespondRequestBody {
  status: 'APPROVED' | 'REJECTED';
  responseMessage?: string;
}

@Controller('api/agent/requests')
@UseGuards(AgentAuthGuard)
export class AgentRequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  async getAgentRequests(@Req() req: Request) {
    const agentId = req['agent'].id;
    return this.requestsService.getAgentRequests(agentId);
  }

  @Patch(':id/respond')
  async respondToRequest(
    @Req() req: Request,
    @Param('id') requestId: string,
    @Body() body: RespondRequestBody,
  ) {
    const agentId = req['agent'].id;

    if (body.status !== 'APPROVED' && body.status !== 'REJECTED') {
      throw new BadRequestException('Status must be APPROVED or REJECTED');
    }

    return this.requestsService.respondToRequest({
      requestId,
      agentId,
      status: body.status,
      responseMessage: body.responseMessage,
    });
  }
}
