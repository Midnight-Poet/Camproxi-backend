import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('api/admin/admins')
@UseGuards(AdminAuthGuard)
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('me')
  async getProfile(@Request() req: any) {
    return this.adminsService.getProfile(req.admin.sub);
  }

  @Patch('update')
  async updateProfile(@Request() req: any, @Body() data: UpdateAdminDto) {
    return this.adminsService.updateProfile(req.admin.sub, data);
  }

  @Patch('change-password')
  async changePassword(@Request() req: any, @Body() data: ChangePasswordDto) {
    return this.adminsService.changePassword(req.admin.sub, data);
  }
}
