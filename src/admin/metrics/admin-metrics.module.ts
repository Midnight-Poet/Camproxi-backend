import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import authConfig from 'src/common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { AdminMetricsService } from './admin-metrics.service';
import { AdminMetricsController } from './admin-metrics.controller';

@Module({
  controllers: [AdminMetricsController],
  providers: [AdminMetricsService],
  imports: [
    JwtModule.registerAsync(authConfig.asProvider()),
    ConfigModule.forFeature(authConfig),
  ],
})
export class AdminMetricsModule {}
