import { forwardRef, Module } from '@nestjs/common';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminsModule } from '../admins/admins.module';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import { BcryptProvider } from '../../common/auth/providers/bcrypt.provider';
import { ConfigModule } from '@nestjs/config';
import authConfig from '../../common/auth/config/auth.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    { provide: HashtagProvider, useClass: BcryptProvider },
  ],
  exports: [AdminAuthService],
  imports: [
    forwardRef(() => AdminsModule),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
})
export class AdminAuthModule {}
