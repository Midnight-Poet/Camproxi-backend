import { Module } from '@nestjs/common';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AdminAuthModule } from '../auth/admin-auth.module';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [AdminAuthModule, PrismaModule],
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  exports: [AuditLogsService],
})
export class AuditLogsModule {}
