import { Injectable, NotFoundException } from '@nestjs/common';
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
}
