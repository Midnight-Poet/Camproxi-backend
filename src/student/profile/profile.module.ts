import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { StudentAuthModule } from '../auth/student-auth.module';
import authConfig from '../../common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [ProfileService],
  controllers: [ProfileController],
  imports: [
    StudentAuthModule,
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
})
export class ProfileModule {}
