import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { StudentAuthModule } from '../../student/auth/student-auth.module';

@Module({
  imports: [AgentAuthModule, CloudinaryModule, StudentAuthModule],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [ServiceService],
})
export class ServiceModule {}
