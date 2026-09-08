import { Module } from '@nestjs/common';
import { ServiceWorkerService } from './service-worker.service';
import { ServiceWorkerController } from './service-worker.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
  imports: [AgentAuthModule, CloudinaryModule],
  controllers: [ServiceWorkerController],
  providers: [ServiceWorkerService],
  exports: [ServiceWorkerService],
})
export class ServiceWorkerModule {}
