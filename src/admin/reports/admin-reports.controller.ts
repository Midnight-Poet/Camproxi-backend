import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AdminReportsService } from './admin-reports.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('api/admin/reports')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getReports(@Request() req: any) {
    return this.adminReportsService.getReports(req.admin);
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
}
