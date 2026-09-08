import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ServiceWorkerService } from './service-worker.service';
import { CreateServiceWorkerDto, UpdateServiceWorkerDto } from './dto/service-worker.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Controller('api/agent/workers')
@UseGuards(AgentAuthGuard)
export class ServiceWorkerController {
  constructor(
    private readonly serviceWorkerService: ServiceWorkerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getWorkers(@Request() req: any) {
    return this.serviceWorkerService.getWorkers(req.agent.id);
  }

  @Get(':id')
  async getWorker(@Request() req: any, @Param('id') id: string) {
    return this.serviceWorkerService.getWorker(req.agent.id, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('profileImage'))
  async createWorker(
    @Request() req: any,
    @Body() data: CreateServiceWorkerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let profileImage: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(
        file,
        `upload/workers/${req.agent.id}`,
      );
      profileImage = result.url;
    }
    return this.serviceWorkerService.createWorker(req.agent.id, data, profileImage);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateWorker(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: UpdateServiceWorkerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let profileImage: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(
        file,
        `upload/workers/${req.agent.id}`,
      );
      profileImage = result.url;
    }
    return this.serviceWorkerService.updateWorker(req.agent.id, id, data, profileImage);
  }

  @Delete(':id')
  async deleteWorker(@Request() req: any, @Param('id') id: string) {
    return this.serviceWorkerService.deleteWorker(req.agent.id, id);
  }
}
