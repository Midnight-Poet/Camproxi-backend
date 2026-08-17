import { Module } from '@nestjs/common';
import { StudentReportsController } from './student-reports.controller';
import { StudentReportsService } from './student-reports.service';

import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
  controllers: [StudentReportsController],
  providers: [StudentReportsService],
})
export class StudentReportsModule {}
