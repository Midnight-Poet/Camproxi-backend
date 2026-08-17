import {
	Controller,
	Patch,
	Req,
	UseGuards,
	Body,
	Post,
	Get,
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { ProfileService } from './profile.service';
import { StudentAuthService } from '../auth/student-auth.service';
import type { Request } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';

@Controller('api/student/profile')
@UseGuards(StudentAuthGuard)
export class ProfileController {
	constructor(
		private profileService: ProfileService,
		private authService: StudentAuthService,
		private cloudinaryService: CloudinaryService,
	) {}

	@Get('school')
	async getSchool(@Req() req: Request) {
		const user = req['user'] as any;
		return this.profileService.getStudentSchool(user.sub || user.id);
	}

	@Patch('update')
	@UseInterceptors(FileInterceptor('profileImage'))
	async UpdateUserProfile(
		@Req() req: Request,
		@Body() userDto: UpdateProfileDto,
		@UploadedFile() file?: Express.Multer.File,
	) {
		const userId = req['user']?.sub;
		if (file) {
			const uploadResult = await this.cloudinaryService
				.uploadImage(file, `upload/profiles/${userId}`)
				.catch(() => {
					throw new Error('Failed to upload profile image');
				});
      // console.log(uploadResult)
			userDto.profileImage = {
				url: uploadResult.url,
				public_id: uploadResult.public_id,
			};
		}
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

	@Post('change-password')
	async changePassword(@Req() req: Request, @Body() body: any) {
		const userId = req['user']?.sub;
		if (!body.oldPassword || !body.newPassword) {
			throw new Error('Both oldPassword and newPassword are required');
		}
		return this.profileService.changePassword(
			userId,
			body.oldPassword,
			body.newPassword,
		);
	}
}
