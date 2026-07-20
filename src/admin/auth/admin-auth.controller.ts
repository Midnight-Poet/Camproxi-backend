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
      console.log(err);
      throw new BadRequestException(err.message || 'Error creating user');
    }
  }
}
