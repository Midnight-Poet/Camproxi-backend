import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Shared infrastructure
import { PrismaModule } from './common/prisma/prisma.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { NotificationModule } from './common/notification/notification.module';
import { ReviewsModule } from './common/reviews/reviews.module';
import { RequestsModule } from './common/requests/requests.module';
import { MailModule } from './common/mail/mail.module';
import { SmsModule } from './common/sms/sms.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Feature modules — one per portal
import { AdminModule } from './admin/admin.module';
import { AgentModule } from './agent/agent.module';
import { StudentModule } from './student/student.module';

@Module({
	imports: [
		// Load environment variables from .env (globally available)
		ConfigModule.forRoot({ isGlobal: true }),
		
		// Global Cache Module
		CacheModule.register({ isGlobal: true, ttl: 60000 }), // 60 seconds default

		// Shared infrastructure
		PrismaModule,
		CloudinaryModule,
		NotificationModule,
		ReviewsModule,
		RequestsModule,
		MailModule,

		// Portal feature modules
		AdminModule,
		AgentModule,
		SmsModule,
		StudentModule,
		ThrottlerModule.forRoot([
			{
				ttl: 60000, // 1 minute window
				limit: 100, // max 100 requests per IP
			},
		]),
	],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	// app.module.ts
})
export class AppModule {}
