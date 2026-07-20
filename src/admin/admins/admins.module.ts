import { forwardRef, Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import { BcryptProvider } from '../../common/auth/providers/bcrypt.provider';

@Module({
  providers: [
    AdminsService,
    { provide: HashtagProvider, useClass: BcryptProvider },
  ],
  controllers: [AdminsController],
  exports: [AdminsService],
  imports: [forwardRef(() => AdminAuthModule)],
})
export class AdminsModule {}
