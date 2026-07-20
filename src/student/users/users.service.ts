import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private readonly hashPassword: HashtagProvider,
  ) {}

  public async getAllUsers() {
    const allUsers = await this.prisma.user.findMany();
    return allUsers;
  }

  public async getUserById(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  public async getUserByEmail(email: string) {
    let user: any = null;
    try {
      user = await this.prisma.user.findFirst({
        where: { email: email },
      });
    } catch (error) {
      throw new RequestTimeoutException(error, {
        description: `User with email ${email} not found.`,
      });
    }
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }
    return user;
  }

  public async addNewUser(userDto: CreateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { email: userDto.email },
    });
    const user2 = await this.prisma.user.findFirst({
      where: { username: userDto.username },
    });
    if (user || user2) {
      throw new UnauthorizedException('User with given email already exists');
    }
    userDto.password = await this.hashPassword.hashPassword(userDto.password);

    const newUser = await this.prisma.user.create({
      data: {
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        username: userDto.username,
        email: userDto.email,
        password: userDto.password,
        schoolId: userDto.schoolId,
        location:
          userDto.longitude && userDto.latitude
            ? { longitude: userDto.longitude, latitude: userDto.latitude }
            : undefined,
      },
    });
    return newUser;
  }
}
