import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
  imports: [AgentAuthModule, CloudinaryModule],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}
