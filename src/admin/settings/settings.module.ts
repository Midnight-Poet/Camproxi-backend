import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [AdminAuthModule, PrismaModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
