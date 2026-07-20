import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  Delete,
} from '@nestjs/common';
import { AgentProfileService } from './agent-profile.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { LoginAgentDto } from './dto/login-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { AgentAuthGuard } from '../auth/agent-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Controller('api/agent')
export class AgentProfileController {
  constructor(
    private readonly agentProfileService: AgentProfileService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('register')
  async register(
    @Body() createAgentDto: CreateAgentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.agentProfileService.register(createAgentDto, res);
  }

  @Post('login')
  async login(
    @Body() loginAgentDto: LoginAgentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.agentProfileService.login(loginAgentDto, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.agentProfileService.logout(res);
  }

  // @Get()
  // getAgent(@Req() req: Request) {
  //   return this.agentProfileService.
  // }

  @UseGuards(AgentAuthGuard)
  @Get('profile')
  getProfile(@Req() req: Request) {
    return this.agentProfileService.getAgentProfile(req['agent'].id);
  }

  @UseGuards(AgentAuthGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    return this.agentProfileService.getAgentProfile(req['agent'].id);
  }

  @UseGuards(AgentAuthGuard)
  @Patch('profile/update')
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfile(
    @Req() req: Request,
    @Body() updateAgentDto: UpdateAgentDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const agentId = req['agent'].id;
    let profileImage;
    if (file) {
      profileImage = await this.cloudinaryService.uploadImage(
        file,
        `upload/profiles/${agentId}`,
      );
    }
    return this.agentProfileService.updateProfile(agentId, updateAgentDto, profileImage);
  }

  @UseGuards(AgentAuthGuard)
  @Delete('profile')
  async deleteAgentAccount(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const agentId = req['agent'].id;
    await this.agentProfileService.deleteAgentAccount(agentId);
    res.clearCookie('jwt');
    return { message: 'Agent account deleted successfully' };
  }
}
