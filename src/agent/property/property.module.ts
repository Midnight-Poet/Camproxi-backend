import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { StudentAuthModule } from '../../student/auth/student-auth.module';

@Module({
  imports: [AgentAuthModule, CloudinaryModule, StudentAuthModule],
  controllers: [PropertyController],
  providers: [PropertyService],
  exports: [PropertyService],
})
export class PropertyModule {}
