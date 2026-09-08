import { Module } from '@nestjs/common';
import { StudentWorkerService } from './student-worker.service';
import { StudentWorkerController } from './student-worker.controller';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
  controllers: [StudentWorkerController],
  providers: [StudentWorkerService],
})
export class StudentWorkerModule {}
