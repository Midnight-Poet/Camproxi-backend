import { Module } from '@nestjs/common';
import { StudentChatController } from './student-chat.controller';
import { ChatModule } from '../../common/chat/chat.module';
import { StudentAuthModule } from '../auth/student-auth.module';

@Module({
  imports: [ChatModule, StudentAuthModule],
  controllers: [StudentChatController],
})
export class StudentChatModule {}
