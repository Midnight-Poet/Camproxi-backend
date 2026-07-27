import { Module } from '@nestjs/common';
import { StudentAuthModule } from './auth/student-auth.module';
import { UsersModule } from './users/users.module';
import { ProfileModule } from './profile/profile.module';
import { SavedModule } from './saved/saved.module';
import { ItemsModule } from './items/items.module';
import { StudentNotificationModule } from './notification/student-notification.module';
import { StudentReviewsModule } from './reviews/student-reviews.module';
import { StudentRequestsModule } from './requests/student-requests.module';
import { StudentChatModule } from './chat/student-chat.module';

@Module({
  imports: [
    StudentAuthModule,
    UsersModule,
    ProfileModule,
    SavedModule,
    ItemsModule,
    StudentNotificationModule,
    StudentReviewsModule,
    StudentRequestsModule,
    StudentChatModule,
  ]
})
export class StudentModule {}
