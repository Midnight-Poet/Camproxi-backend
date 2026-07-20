import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import authConfig from '../../../common/auth/config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(req);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(
        token,
        this.authConfiguration,
      );
      req['admin'] = payload;
    } catch (err) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromCookie(request: Request): any | undefined {
    if (request.cookies && 'access_token' in request.cookies) {
      return request.cookies.access_token;
    }
    return undefined;
  }
}
