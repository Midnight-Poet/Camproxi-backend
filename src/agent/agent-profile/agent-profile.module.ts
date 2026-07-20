import { Module } from '@nestjs/common';
import { AgentProfileController } from './agent-profile.controller';
import { AgentProfileService } from './agent-profile.service';
import { AgentAuthModule } from '../auth/agent-auth.module';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';

@Module({
  imports: [AgentAuthModule, CloudinaryModule],
  controllers: [AgentProfileController],
  providers: [AgentProfileService],
})
export class AgentProfileModule {}
