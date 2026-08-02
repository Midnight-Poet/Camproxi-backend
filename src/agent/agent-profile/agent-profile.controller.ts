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
  Param,
  BadRequestException,
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
    // Just to commit
    return this.agentProfileService.register(createAgentDto, res);
  }

  @Post('login')
  async login(
    @Body() loginAgentDto: LoginAgentDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.agentProfileService.login(loginAgentDto, res);
  }

  @UseGuards(AgentAuthGuard)
  @Post('send-verification')
  async sendVerification(@Req() req: Request) {
    const agentId = req['agent']?.id;
    return this.agentProfileService.sendVerificationOtp(agentId);
  }

  @UseGuards(AgentAuthGuard)
  @Post('verify-email')
  async verifyEmail(@Req() req: Request, @Body() body: { otp: string }) {
    const agentId = req['agent']?.id;
    if (!body.otp) {
      throw new BadRequestException('OTP is required');
    }
    return this.agentProfileService.verifyEmail(agentId, body.otp);
  }
  @UseGuards(AgentAuthGuard)
  @Post('send-phone-verification')
  async sendPhoneVerification(@Req() req: Request) {
    const agentId = req['agent']?.id;
    return this.agentProfileService.sendPhoneVerificationOtp(agentId);
  }

  @UseGuards(AgentAuthGuard)
  @Post('verify-phone')
  async verifyPhone(@Req() req: Request, @Body() body: { otp: string }) {
    const agentId = req['agent']?.id;
    if (!body.otp) {
      throw new BadRequestException('OTP is required');
    }
    return this.agentProfileService.verifyPhone(agentId, body.otp);
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
  @Get('student/:id')
  getStudentProfile(@Param('id') id: string) {
    return this.agentProfileService.getStudentProfile(id);
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

  @UseGuards(AgentAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: Request, @Body() body: any) {
    const agentId = req['agent'].id;
    if (!body.oldPassword || !body.newPassword) {
      throw new BadRequestException('Both oldPassword and newPassword are required');
    }
    return this.agentProfileService.changePassword(agentId, body.oldPassword, body.newPassword);
  }
}
