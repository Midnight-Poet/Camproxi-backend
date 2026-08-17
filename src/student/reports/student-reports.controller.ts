import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { StudentReportsService } from './student-reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';

@Controller('api/student/reports')
@UseGuards(StudentAuthGuard)
export class StudentReportsController {
  constructor(private readonly studentReportsService: StudentReportsService) {}

  @Post()
  async createReport(@Request() req: any, @Body() body: CreateReportDto) {
    return this.studentReportsService.createReport(req.user.sub, body);
  }

  @Get()
  async getMyReports(@Request() req: any) {
    return this.studentReportsService.getMyReports(req.user.sub);
  }
}
