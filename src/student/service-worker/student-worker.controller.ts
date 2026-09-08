import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { StudentWorkerService } from './student-worker.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { Request } from 'express';

@Controller('api/student/workers')
@UseGuards(StudentAuthGuard)
export class StudentWorkerController {
  constructor(private readonly studentWorkerService: StudentWorkerService) {}

  @Get()
  async getWorkers(@Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.studentWorkerService.getWorkers(schoolId);
  }

  @Get('agent/:agentId')
  async getWorkersByAgentId(@Param('agentId') agentId: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.studentWorkerService.getWorkersByAgentId(agentId, schoolId);
  }

  @Get(':id')
  async getWorkerById(@Param('id') id: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.studentWorkerService.getWorkerById(id, schoolId);
  }
}
