import { Module } from '@nestjs/common';
import { StudentRequestsController } from './student-requests.controller';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
  controllers: [StudentRequestsController],
})
export class StudentRequestsModule {}
