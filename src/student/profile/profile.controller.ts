import { Controller, Patch, Req, UseGuards, Body, Post } from '@nestjs/common';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { ProfileService } from './profile.service';
import { StudentAuthService } from '../auth/student-auth.service';
import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('api/student/profile')
@UseGuards(StudentAuthGuard)
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    private authService: StudentAuthService,
  ) {}

  @Patch('update')
  async UpdateUserProfile(
    @Req() req: Request,
    @Body() userDto: UpdateProfileDto,
  ) {
    const userId = req['user']?.sub;
    return this.profileService.UpdateProfile(userId, userDto);
  }

  @Post('send-verification')
  async sendVerification(@Req() req: Request) {
    const userId = req['user']?.sub;
    return this.authService.sendVerificationOtp(userId);
  }

  @Post('verify-email')
  async verifyEmail(@Req() req: Request, @Body() body: { otp: string }) {
    const userId = req['user']?.sub;
    if (!body.otp) {
      throw new Error('OTP is required'); // Will be caught by NestJS exception filter
    }
    return this.authService.verifyEmail(userId, body.otp);
  }
  @Post('send-phone-verification')
  async sendPhoneVerification(@Req() req: Request) {
    const userId = req['user']?.sub;
    return this.authService.sendPhoneVerificationOtp(userId);
  }

  @Post('verify-phone')
  async verifyPhone(@Req() req: Request, @Body() body: { otp: string }) {
    const userId = req['user']?.sub;
    if (!body.otp) {
      throw new Error('OTP is required'); // Will be caught by NestJS exception filter
    }
    return this.authService.verifyPhone(userId, body.otp);
  }
}
