import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Shared infrastructure
import { PrismaModule } from './common/prisma/prisma.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { NotificationModule } from './common/notification/notification.module';
import { ReviewsModule } from './common/reviews/reviews.module';
import { RequestsModule } from './common/requests/requests.module';

// Feature modules — one per portal
import { AdminModule } from './admin/admin.module';
import { AgentModule } from './agent/agent.module';
import { StudentModule } from './student/student.module';

@Module({
  imports: [
    // Load environment variables from .env (globally available)
    ConfigModule.forRoot({ isGlobal: true }),

    // Shared infrastructure
    PrismaModule,
    CloudinaryModule,
    NotificationModule,
    ReviewsModule,
    RequestsModule,

    // Portal feature modules
    AdminModule,
    AgentModule,
    StudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
