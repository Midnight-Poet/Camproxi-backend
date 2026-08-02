import { Module } from '@nestjs/common';
import { AdminContentService } from './admin-content.service';
import { AdminContentController } from './admin-content.controller';

@Module({
  controllers: [AdminContentController],
  providers: [AdminContentService],
})
export class AdminContentModule {}
