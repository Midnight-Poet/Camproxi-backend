import { Controller, Get, Param, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('api/admin/users')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('students')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getStudents(@Request() req: any) {
    return this.adminUsersService.getStudents(req.admin);
  }

  @Get('students/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getStudentDetails(@Request() req: any, @Param('id') id: string) {
    return this.adminUsersService.getStudentDetails(req.admin, id);
  }

  @Patch('students/:id/suspend')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async suspendStudent(@Request() req: any, @Param('id') id: string, @Body('suspend') suspend: boolean) {
    return this.adminUsersService.toggleStudentSuspension(req.admin, id, suspend);
  }

  @Get('agents')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getAgents(@Request() req: any) {
    return this.adminUsersService.getAgents(req.admin);
  }

  @Get('agents/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getAgentDetails(@Request() req: any, @Param('id') id: string) {
    return this.adminUsersService.getAgentDetails(req.admin, id);
  }

  @Patch('agents/:id/suspend')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async suspendAgent(@Request() req: any, @Param('id') id: string, @Body('suspend') suspend: boolean) {
    return this.adminUsersService.toggleAgentSuspension(req.admin, id, suspend);
  }
}
