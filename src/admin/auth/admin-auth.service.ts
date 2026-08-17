import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MailService } from '../../common/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { AdminsService } from '../admins/admins.service';
import { LoginDto } from './dto/login.dto';
import { HashtagProvider } from '../../common/auth/providers/hashtag.provider';
import authConfig from '../../common/auth/config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminAuthService {
  constructor(
    @Inject(forwardRef(() => AdminsService))
    private readonly adminsService: AdminsService,
    private readonly comparePassword: HashtagProvider,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  public async login(user: LoginDto) {
    const userDetail = await this.adminsService.getAdminByEmail(user.email);
    const passwordMatch = await this.comparePassword.comparePassword(
      user.password,
      userDetail.password,
    );
    if (passwordMatch) {
      const token = await this.jwtService.signAsync(
        { 
          sub: userDetail.id, 
          email: userDetail.email, 
          role: userDetail.role,
          schoolId: userDetail.schoolId,
          campusName: userDetail.campusName 
        },
        {
          secret: this.authConfiguration.secret,
          expiresIn: '2d',
          audience: this.authConfiguration.audience,
          issuer: this.authConfiguration.issuer,
        },
      );
      return {
        token: token,
        user: {
          id: userDetail.id,
          email: userDetail.email,
          name: userDetail.name,
        },
      };
    } else {
      throw new UnauthorizedException('Incorrect Password');
    }
  }

  public async createUser(roleOrKey: string, user: any) {
    const allUsers = await this.adminsService.getAllAdmins();
    if (!allUsers || allUsers.length === 0) {
      if (roleOrKey === process.env.ADMIN_PASSWORD) {
        const newUser: any = await this.adminsService.addNewUser(user);
        return newUser;
      } else {
        throw new UnauthorizedException(
          'Invalid bootstrap key. You are not authorized to add a new Admin.',
        );
      }
    } else {
      if (roleOrKey === 'SUPER_ADMIN') {
        const newUser: any = await this.adminsService.addNewUser(user);
        return newUser;
      } else {
        throw new UnauthorizedException('Unauthorized action: Only SUPER_ADMINs can create admins');
      }
    }
  }

  public async forgotPassword(email: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { resetOtp: hashedOtp, resetOtpExpiry },
    });

    this.mailService.sendPasswordResetEmail(admin.email, otp, admin.name || 'Admin').catch(console.error);

    return { message: 'Password reset OTP sent to email successfully' };
  }

  public async resetPassword(email: string, otp: string, newPassword: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (!admin.resetOtp || !admin.resetOtpExpiry) {
      throw new BadRequestException('No password reset requested');
    }

    if (admin.resetOtpExpiry < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpValid = await bcrypt.compare(otp, admin.resetOtp);
    if (!isOtpValid) {
      throw new BadRequestException('Invalid OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }
}
