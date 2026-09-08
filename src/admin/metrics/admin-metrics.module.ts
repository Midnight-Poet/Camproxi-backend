import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminMetricsService } from './admin-metrics.service';
import { AdminMetricsController } from './admin-metrics.controller';

@Module({
  imports: [AdminAuthModule],
  controllers: [AdminMetricsController],
  providers: [AdminMetricsService],
})
export class AdminMetricsModule {}
