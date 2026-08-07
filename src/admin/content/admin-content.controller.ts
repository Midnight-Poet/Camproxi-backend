import { Controller, Get, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { AdminContentService } from './admin-content.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('api/admin/content')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get('pending')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getPendingContent(
    @Request() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.adminContentService.getPendingContent(
      req.admin,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Patch('properties/:id/verify')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async verifyProperty(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.verifyProperty(req.admin, id);
  }

  @Patch('products/:id/verify')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async verifyProduct(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.verifyProduct(req.admin, id);
  }

  @Patch('services/:id/verify')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async verifyService(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.verifyService(req.admin, id);
  }
}
