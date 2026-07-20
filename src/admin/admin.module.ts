import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AdminAuthModule } from './auth/admin-auth.module';
import { SchoolModule } from './school/school.module';

@Module({
  imports: [AdminAuthModule, AdminsModule, SchoolModule],
})
export class AdminModule {}
