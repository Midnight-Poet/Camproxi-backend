import {
	Controller,
	Body,
	Post,
	HttpCode,
	HttpStatus,
	Res,
	BadRequestException,
	Get,
	Param,
} from '@nestjs/common';
import { StudentAuthService } from './student-auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('api/student/auth')
export class StudentAuthController {
	constructor(private readonly authService: StudentAuthService) {}

	@Post('login')
	@HttpCode(HttpStatus.OK)
	async getUsers(
		@Body() user: LoginDto,
		@Res({ passthrough: true }) response: Response,
	) {
		const result = await this.authService.login(user);
		try {
			response.cookie('access_token', result.token, {
				httpOnly: true,
				secure: process.env.ENV_MODE === 'PROD',
				sameSite: 'lax',
				maxAge: 1000 * 60 * 60,
				path: '/',
			});
			// console.log(result)
			return {
				message: 'Login successful',
				user: result.user,
			};
		} catch (error) {
			return error;
		}
	}

	@Post('create')
	public async createUser(@Body() user: CreateUserDto, 
		@Res({ passthrough: true }) response: Response,) {
		try {
      const result = await this.authService.createUser(user);
			response.cookie('access_token', result.token, {
				httpOnly: true,
				secure: true,
				sameSite: 'none',
				maxAge: 1000 * 60 * 60,
				path: '/',
			});
			return result 
		} catch (error) {
			throw new BadRequestException('Unable to create User');
		}
	}

	@Post('logout')
	@HttpCode(HttpStatus.OK)
	public async logout(@Res({ passthrough: true }) response: Response) {
		response.clearCookie('access_token', {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
		});
		return { message: 'Logout successful' };
	}

	@Get('email/:email')
	public async getUserByEmail(@Param('email') email: string) {
		return this.authService.findUserByEmail(email)
	}

	@Get('username/:username')
	public async getUserByUsername(@Param('username') username: string) {
		return this.authService.findUserByUsername(username)
	}
}
