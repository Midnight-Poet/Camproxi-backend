import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoreService } from './store.service';
import { CreateOrUpdateStoreDto } from './dto/store.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Controller('api/agent/store')
@UseGuards(AgentAuthGuard)
export class StoreController {
  constructor(
    private readonly storeService: StoreService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async getStores(@Request() req: any) {
    return this.storeService.getStores(req.agent.id);
  }

  @Get(':id')
  async getStore(@Request() req: any, @Param('id') id: string) {
    return this.storeService.getStore(req.agent.id, id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('bannerImage'))
  async createStore(
    @Request() req: any,
    @Body() data: CreateOrUpdateStoreDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let bannerImage: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(
        file,
        `upload/stores/${req.agent.id}`,
      );
      bannerImage = result.url;
    }
    return this.storeService.createStore(req.agent.id, data, bannerImage);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('bannerImage'))
  async updateStore(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: CreateOrUpdateStoreDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let bannerImage: string | undefined;
    if (file) {
      const result = await this.cloudinaryService.uploadImage(
        file,
        `upload/stores/${req.agent.id}`,
      );
      bannerImage = result.url;
    }
    return this.storeService.updateStore(req.agent.id, id, data, bannerImage);
  }

  @Delete(':id')
  async deleteStore(@Request() req: any, @Param('id') id: string) {
    return this.storeService.deleteStore(req.agent.id, id);
  }
}
