import { Module } from '@nestjs/common';
import { StudentStoreService } from './student-store.service';
import { StudentStoreController } from './student-store.controller';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [StudentAuthModule],
  controllers: [StudentStoreController],
  providers: [StudentStoreService],
})
export class StudentStoreModule {}
