import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AgentAuthService } from './agent-auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AgentAuthService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromCookie(request);

    if (!token) {
      throw new UnauthorizedException('Please login to access this resource');
    }

    try {
      const decoded = this.authService.verifyToken(token);
      const agent = await this.prisma.agent.findUnique({
        where: { id: decoded.agentId },
      });

      if (!agent) {
        throw new UnauthorizedException('Agent not found');
      }

      request['agent'] = agent;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return request.cookies?.jwt;
  }
}
