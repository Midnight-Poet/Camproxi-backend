import { forwardRef, Module } from '@nestjs/common';
import { StudentAuthController } from './student-auth.controller';
import { StudentAuthService } from './student-auth.service';
import { UsersModule } from '../users/users.module';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import { BcryptProvider } from '../../common/auth/providers/bcrypt.provider';
import { ConfigModule } from '@nestjs/config';
import authConfig from '../../common/auth/config/auth.config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [StudentAuthController],
  providers: [
    StudentAuthService,
    { provide: HashtagProvider, useClass: BcryptProvider },
  ],
  exports: [StudentAuthService, JwtModule, ConfigModule],
  imports: [
    forwardRef(() => UsersModule),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
    
  ],
})
export class StudentAuthModule {}
