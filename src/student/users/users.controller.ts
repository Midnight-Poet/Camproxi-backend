import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Req
} from '@nestjs/common';
import { UsersService } from './users.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';
import { CurrentUser } from '../auth/decorators/studentAuth.decorator';
import { Request } from 'express';

@Controller('api/student/users')
@UseGuards(StudentAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Get()
  // async getUsers(
  //   @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  //   @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  // ) {
  //   const users = await this.usersService.getAllUsers();
  //   return users;
  // }

  @Get('me')
  async getProfile(@Req() req: Request) {
    // user contains the decoded JWT payload
    const userId = req['user'].sub
    return this.usersService.getUserById(userId);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.getUserById(id);
    return user;
  }

  // @UseGuards(JwtAuthGuard)
  
}
