import { Module } from '@nestjs/common';
import { AgentAuthModule } from './auth/agent-auth.module';
import { AgentProfileModule } from './agent-profile/agent-profile.module';
import { PropertyModule } from './property/property.module';
import { ProductModule } from './product/product.module';
import { ServiceModule } from './service/service.module';
import { AgentNotificationModule } from './notification/agent-notification.module';
import { AgentReviewsModule } from './reviews/agent-reviews.module';
import { AgentRequestsModule } from './requests/agent-requests.module';

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
  ],
})
export class AgentModule {}
