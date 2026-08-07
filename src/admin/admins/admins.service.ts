import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';

@Injectable()
export class AdminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashPassword: HashtagProvider,
  ) {}

  public async getAdminByEmail(email: string) {
    let user: any | null;
    try {
      user = await this.prisma.admin.findFirst({
        where: { email: email },
      });
    } catch (error) {
      console.error('Error retrieving admin by email:', error);
      throw new NotFoundException('Error retrieving admin by email');
    }
    if (!user) {
      throw new NotFoundException('Admin not found');
    }
    return user;
  }

  public async addNewUser(user: CreateAdminDto) {
    const ExistingUser = await this.prisma.admin.findFirst({
      where: { email: user.email },
    });
    if (ExistingUser) {
      throw new NotAcceptableException('User with given email already exists');
    }
    try {
      user.password = await this.hashPassword.hashPassword(user.password);
      const newUser = await this.prisma.admin.create({
        data: user,
      });
      return newUser;
    } catch (error) {
      console.error('Error adding new admin:', error);
      throw new Error('Error adding new admin');
    }
  }

  public async getAllAdmins() {
    try {
      return await this.prisma.admin.findMany({
        select: { id: true, name: true, email: true, role: true, schoolId: true, campusName: true, createdAt: true }
      });
    } catch (err) {
      throw new Error('Error retrieving admins');
    }
  }

  public async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        schoolId: true,
        campusName: true,
        createdAt: true,
      }
    });

    if (!admin) {
      throw new NotFoundException('Admin profile not found');
    }
    return admin;
  }

  public async updateProfile(adminId: string, data: UpdateAdminDto) {
    try {
      const updated = await this.prisma.admin.update({
        where: { id: adminId },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          schoolId: true,
          campusName: true,
          createdAt: true,
        }
      });
      return updated;
    } catch (error) {
      throw new Error('Could not update profile');
    }
  }

  public async changePassword(adminId: string, data: ChangePasswordDto) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isMatch = await this.hashPassword.comparePassword(data.oldPassword, admin.password);
    if (!isMatch) {
      throw new NotAcceptableException('Incorrect old password');
    }

    const newHashed = await this.hashPassword.hashPassword(data.newPassword);

    await this.prisma.admin.update({
      where: { id: adminId },
      data: { password: newHashed }
    });

    return { message: 'Password changed successfully' };
  }
}

