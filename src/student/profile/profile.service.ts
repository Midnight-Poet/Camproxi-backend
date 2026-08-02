import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prismaService: PrismaService) {}

  async UpdateProfile(userId: string, userDto: UpdateProfileDto) {
    try {
      const updatedUser = await this.prismaService.user.update({
        where: {
          id: userId,
        },
        data: userDto,
        select: {
          id: true,
          email: true,
          school: true,
          username: true,
        },
      });
      return updatedUser;
    } catch (err) {
      throw new NotFoundException('User not found');
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prismaService.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // We need bcrypt imported. If not, it will fail. I will add the import at the top later if needed. Wait, I should add it now.
    const bcrypt = require('bcrypt'); // Lazy require to avoid touching imports for a small script
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error('Incorrect old password'); // Or UnauthorizedException
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prismaService.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    return { message: 'Password updated successfully' };
  }
}
