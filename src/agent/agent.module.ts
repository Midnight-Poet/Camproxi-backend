import { Module } from '@nestjs/common';
import { AgentAuthModule } from './auth/agent-auth.module';
import { AgentProfileModule } from './agent-profile/agent-profile.module';
import { PropertyModule } from './property/property.module';
import { ProductModule } from './product/product.module';
import { ServiceModule } from './service/service.module';
import { AgentNotificationModule } from './notification/agent-notification.module';
import { AgentReviewsModule } from './reviews/agent-reviews.module';
import { AgentRequestsModule } from './requests/agent-requests.module';
import { AgentChatModule } from './chat/agent-chat.module';
import { AgentReportsModule } from './reports/agent-reports.module';
import { MetricsModule } from './metrics/metrics.module';
import { StoreModule } from './store/store.module';
import { ServiceWorkerModule } from './service-worker/service-worker.module';

@Module({
  imports: [
    AgentAuthModule,
    AgentProfileModule,
    PropertyModule,
    ProductModule,
    ServiceModule,
    AgentNotificationModule,
    AgentReviewsModule,
    AgentRequestsModule,
    AgentChatModule,
    AgentReportsModule,
    MetricsModule,
    StoreModule,
    ServiceWorkerModule,
  ],
})
export class AgentModule {}
