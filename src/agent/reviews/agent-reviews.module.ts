import { Module } from '@nestjs/common';
import { AgentReviewsController } from './agent-reviews.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';

@Module({
  imports: [AgentAuthModule],
  controllers: [AgentReviewsController],
})
export class AgentReviewsModule {}
