import { Module } from '@nestjs/common';
import { StudentReviewsController } from './student-reviews.controller';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
  controllers: [StudentReviewsController],
})
export class StudentReviewsModule {}
