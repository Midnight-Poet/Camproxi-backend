import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
  ) {}

  public async login(user: LoginDto) {
    const userDetail = await this.adminsService.getAdminByEmail(user.email);
    const passwordMatch = await this.comparePassword.comparePassword(
      user.password,
      userDetail.password,
    );
    if (passwordMatch) {
      const token = await this.jwtService.signAsync(
        { sub: userDetail.id, email: userDetail.email, role: userDetail.role },
        {
          secret: this.authConfiguration.secret,
          expiresIn: this.authConfiguration.expiresIn,
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
}
