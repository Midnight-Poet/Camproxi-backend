import { Controller, Patch, Req, UseGuards, Body } from '@nestjs/common';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { ProfileService } from './profile.service';
import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('api/student/profile')
@UseGuards(StudentAuthGuard)
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Patch('update')
  async UpdateUserProfile(
    @Req() req: Request,
    @Body() userDto: UpdateProfileDto,
  ) {
    const userId = req['user']?.sub;
    return this.profileService.UpdateProfile(userId, userDto);
  }

  // @Get
}
