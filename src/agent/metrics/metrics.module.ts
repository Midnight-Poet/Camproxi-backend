import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AgentAuthModule } from '../auth/agent-auth.module'; // ensure auth module is imported if needed for guards, though usually guards resolve if configured globally or within same tree

@Module({
  imports: [PrismaModule, AgentAuthModule],
  controllers: [MetricsController],
  providers: [MetricsService],
})
export class MetricsModule {}
