import {
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminDto } from '../admins/dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { AdminCreateGuard } from './guards/admin-create.guard';

@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AdminAuthService) {}

  @Post('/login')
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
        maxAge: 2 * 24 * 60 * 60 * 1000,
        path: '/',
      });
      return {
        message: 'Login successful',
        user: result.user
      };
    } catch (error) {
      return error;
    }
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.ENV_MODE === 'PROD',
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AdminCreateGuard)
  @Post('/create')
  public async createUser(
    @Body() data: { user: CreateAdminDto; reqPassword?: { key: string } },
    @Req() req: Request,
  ) {
    try {
      // If the user has a valid JWT, req['admin'] will exist with their role.
      // If req['admin'] doesn't exist, they bypassed the guard via bootstrap mode (0 admins in DB).
      // We strictly use the JWT role if authenticated, otherwise we use their provided bootstrap key.
      const roleOrKey = req['admin'] ? req['admin'].role : data.reqPassword?.key;

      if (!roleOrKey) {
        throw new UnauthorizedException('Missing authentication or bootstrap key');
      }

      const result: any = await this.authService.createUser(roleOrKey, data.user);
      return result?.newUser || result;
    } catch (err: any) {
      throw new BadRequestException(err.message || 'Error creating user');
    }
  }

  @Post('/forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.forgotPassword(email);
  }

  @Post('/reset-password')
  async resetPassword(@Body() body: any) {
    const { email, otp, newPassword } = body;
    if (!email || !otp || !newPassword) {
      throw new BadRequestException('Email, otp, and newPassword are required');
    }
    return this.authService.resetPassword(email, otp, newPassword);
  }
}
