import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { StudentAuthModule } from '../auth/student-auth.module';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import { BcryptProvider } from '../../common/auth/providers/bcrypt.provider';
import { JwtModule } from '@nestjs/jwt';
import authConfig from '../../common/auth/config/auth.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: HashtagProvider, useClass: BcryptProvider },
  ],
  exports: [UsersService],
  imports: [
    forwardRef(() => StudentAuthModule),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
})
export class UsersModule {}
