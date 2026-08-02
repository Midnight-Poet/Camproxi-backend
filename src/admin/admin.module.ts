import { Module } from '@nestjs/common';
import { AdminsModule } from './admins/admins.module';
import { AdminAuthModule } from './auth/admin-auth.module';
import { SchoolModule } from './school/school.module';

import { AdminUsersModule } from './users/admin-users.module';
import { AdminContentModule } from './content/admin-content.module';
import { AdminReportsModule } from './reports/admin-reports.module';
import { AdminMetricsModule } from './metrics/admin-metrics.module';

@Module({
  imports: [
    AdminAuthModule, 
    AdminsModule, 
    SchoolModule, 
    AdminUsersModule, 
    AdminContentModule,
    AdminReportsModule,
    AdminMetricsModule
  ],
})
export class AdminModule {}
