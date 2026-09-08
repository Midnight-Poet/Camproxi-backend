import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { StudentStoreService } from './student-store.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { Request } from 'express';

@Controller('api/student/stores')
@UseGuards(StudentAuthGuard)
export class StudentStoreController {
  constructor(private readonly studentStoreService: StudentStoreService) {}

  @Get()
  async getStores(@Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.studentStoreService.getStores(schoolId);
  }

  @Get('agent/:agentId')
  async getStoresByAgentId(@Param('agentId') agentId: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.studentStoreService.getStoresByAgentId(agentId, schoolId);
  }

  @Get(':id')
  async getStoreById(@Param('id') id: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.studentStoreService.getStoreById(id, schoolId);
  }
}
