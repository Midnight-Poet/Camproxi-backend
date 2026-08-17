import { Controller, Get, Post, Param, Patch, Delete, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole, ReportStatus } from '@prisma/client';

@Controller('api/admin/reports')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getReports(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: ReportStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminReportsService.getReports(
      req.admin,
      Number(page),
      Number(limit),
      status,
      startDate,
      endDate,
    );
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getReportById(@Request() req: any, @Param('id') id: string) {
    return this.adminReportsService.getReportById(req.admin, id);
  }

  @Patch(':id/reply')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async replyToReport(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reply') reply: string,
  ) {
    return this.adminReportsService.replyToReport(req.admin, id, reply);
  }

  @Patch(':id/resolve')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async resolveReport(@Request() req: any, @Param('id') id: string) {
    return this.adminReportsService.resolveReport(req.admin, id);
  }

  @Patch(':id/reopen')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async reopenReport(@Request() req: any, @Param('id') id: string) {
    return this.adminReportsService.reopenReport(req.admin, id);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async deleteReport(@Request() req: any, @Param('id') id: string) {
    return this.adminReportsService.deleteReport(req.admin, id);
  }

  @Patch(':id/assign')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN)
  async assignReport(
    @Request() req: any,
    @Param('id') id: string,
    @Body('adminId') adminId: string,
  ) {
    return this.adminReportsService.assignReport(req.admin, id, adminId);
  }
}
