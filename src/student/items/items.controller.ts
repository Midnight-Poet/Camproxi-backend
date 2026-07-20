import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ItemsService } from './items.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { Request } from 'express';

@Controller('api/student/items')
@UseGuards(StudentAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('products')
  async getProducts(@Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.itemsService.getProducts(schoolId);
  }

  @Get('products/:id')
  async getProductById(@Param('id') id: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.itemsService.getProductById(id, schoolId);
  }

  @Get('properties')
  async getProperties(@Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.itemsService.getProperties(schoolId);
  }

  @Get('properties/:id')
  async getPropertyById(@Param('id') id: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.itemsService.getPropertyById(id, schoolId);
  }

  @Get('services')
  async getServices(@Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.itemsService.getServices(schoolId);
  }

  @Get('services/:id')
  async getServiceById(@Param('id') id: string, @Req() req: Request) {
    const schoolId = req['user'].schoolId;
    return this.itemsService.getServiceById(id, schoolId);
  }
}
