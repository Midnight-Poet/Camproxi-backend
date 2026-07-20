import { Module } from '@nestjs/common';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { JwtModule } from '@nestjs/jwt';
import authConfig from '../../common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config/dist/config.module';

@Module({
  controllers: [SchoolController],
  providers: [SchoolService],
  imports: [
    JwtModule.registerAsync(authConfig.asProvider()),
    ConfigModule.forFeature(authConfig),
  ],
})
export class SchoolModule {}
