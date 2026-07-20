import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import authConfig from '../../../common/auth/config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminsService } from '../../admins/admins.service';

@Injectable()
export class AdminCreateGuard extends AdminAuthGuard implements CanActivate {
  constructor(
    jwtService: JwtService,
    @Inject(authConfig.KEY) authConfiguration: ConfigType<typeof authConfig>,
    @Inject(forwardRef(() => AdminsService)) private readonly adminsService: AdminsService,
  ) {
    super(jwtService, authConfiguration);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allUsers = await this.adminsService.getAllAdmins();
    // If the database has no admins, allow bypass of the JWT check for bootstrapping
    if (allUsers.length === 0) {
      return true;
    }
    
    // Otherwise, enforce standard JWT authentication
    return super.canActivate(context);
  }
}
