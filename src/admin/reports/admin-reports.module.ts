import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import authConfig from 'src/common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { AdminReportsService } from './admin-reports.service';
import { AdminReportsController } from './admin-reports.controller';

@Module({
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
  imports: [
    JwtModule.registerAsync(authConfig.asProvider()),
    ConfigModule.forFeature(authConfig),
  ],
})
export class AdminReportsModule {}
