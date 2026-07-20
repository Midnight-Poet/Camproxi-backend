import { Module } from '@nestjs/common';
import { PropertyService } from './property.service';
import { PropertyController } from './property.controller';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
  imports: [AgentAuthModule, CloudinaryModule],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
