import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminContentService } from './admin-content.service';
import { AdminContentController } from './admin-content.controller';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminContentController],
  providers: [AdminContentService],
})
export class AdminContentModule {}
