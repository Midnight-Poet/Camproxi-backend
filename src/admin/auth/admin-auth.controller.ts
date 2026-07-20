import {
  Controller,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminDto } from '../admins/dto/create-admin.dto';
import { LoginDto } from './dto/login.dto';
import type { Request, Response } from 'express';
import { AdminAuthGuard } from './guards/admin-auth.guard';

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
        maxAge: 1000 * 60 * 60,
        path: '/',
      });
      return {
        message: 'Login successful',
        user: result.user,
        token: result.token,
      };
    } catch (error) {
      return error;
    }
  }

  @UseGuards(AdminAuthGuard)
  @Post('/create')
  public async createUser(
    @Body() data: { user: CreateAdminDto; reqPassword: { key: string } },
    @Req() req: Request,
  ) {
    try {
      const role = req['admin']?.role;
      let result: any;
      if (data.reqPassword) {
        result = await this.authService.createUser(
          data.reqPassword.key,
          data.user,
        );
      } else {
        result = await this.authService.createUser(role, data.user);
      }
      return result?.newUser || result;
    } catch (err) {
      console.log(err);
      throw new Error('error creating user');
    }
  }
}
