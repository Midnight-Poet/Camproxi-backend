import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    AdminAuthModule,
    AuditLogsModule,
  ],
  controllers: [AdminUsersController],
  providers: [AdminUsersService],
})
export class AdminUsersModule {}
