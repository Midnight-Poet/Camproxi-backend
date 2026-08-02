import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AdminMetricsService } from './admin-metrics.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('api/admin/metrics')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminMetricsController {
  constructor(private readonly adminMetricsService: AdminMetricsService) {}

  @Get('dashboard')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getDashboardMetrics(@Request() req: any) {
    return this.adminMetricsService.getDashboardMetrics(req.admin);
  }
}
