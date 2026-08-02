import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import authConfig from 'src/common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
  imports: [
    JwtModule.registerAsync(authConfig.asProvider()),
    ConfigModule.forFeature(authConfig),
  ],
})
export class AdminUsersModule {}
