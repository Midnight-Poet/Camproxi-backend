import { Controller, Get, Param, Patch, UseGuards, Request, Query, Body } from '@nestjs/common';
import { AdminContentService } from './admin-content.service';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminRole } from '@prisma/client';

@Controller('api/admin/content')
@UseGuards(AdminAuthGuard, RolesGuard)
export class AdminContentController {
  constructor(private readonly adminContentService: AdminContentService) {}

  @Get('all')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getAllContent(
    @Request() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
    @Query('category') category: string,
  ) {
    return this.adminContentService.getAllContent(
      req.admin,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
      category,
    );
  }

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

  @Patch('properties/:id/reject')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async rejectProperty(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminContentService.rejectProperty(req.admin, id, reason);
  }

  @Patch('products/:id/reject')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async rejectProduct(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminContentService.rejectProduct(req.admin, id, reason);
  }

  @Patch('services/:id/reject')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async rejectService(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminContentService.rejectService(req.admin, id, reason);
  }

  // --- GET SINGLE ITEM DETAILS ---
  @Get('properties/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getPropertyDetail(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.getPropertyDetail(req.admin, id);
  }

  @Get('products/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getProductDetail(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.getProductDetail(req.admin, id);
  }

  @Get('services/:id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async getServiceDetail(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.getServiceDetail(req.admin, id);
  }

  // --- RESET TO PENDING ---
  @Patch('properties/:id/reset')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async resetProperty(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.resetProperty(req.admin, id);
  }

  @Patch('products/:id/reset')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async resetProduct(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.resetProduct(req.admin, id);
  }

  @Patch('services/:id/reset')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async resetService(@Request() req: any, @Param('id') id: string) {
    return this.adminContentService.resetService(req.admin, id);
  }

  // --- TAKEDOWN VERIFIED ITEMS ---
  @Patch('properties/:id/takedown')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async takedownProperty(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminContentService.takedownProperty(req.admin, id, reason);
  }

  @Patch('products/:id/takedown')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async takedownProduct(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminContentService.takedownProduct(req.admin, id, reason);
  }

  @Patch('services/:id/takedown')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.ADMIN, AdminRole.OFFICIAL)
  async takedownService(@Request() req: any, @Param('id') id: string, @Body('reason') reason: string) {
    return this.adminContentService.takedownService(req.admin, id, reason);
  }
}
