import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
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
      return await this.prisma.admin.findMany();
    } catch (err) {
      throw new Error('Error retrieving admins');
    }
  }
}
