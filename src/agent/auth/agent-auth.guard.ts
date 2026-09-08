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
      if (decoded.portal && decoded.portal !== 'AGENT') {
        throw new UnauthorizedException('Invalid token for agent portal');
      }

      const agent = await this.prisma.agent.findUnique({
        where: { id: decoded.agentId },
      });

      if (!agent) {
        throw new UnauthorizedException('Agent not found');
      }

      if (agent.isSuspended) {
        throw new UnauthorizedException('Account is suspended. Please contact support.');
      }

      request['agent'] = agent;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    if (request.cookies?.jwt) {
      return request.cookies.jwt;
    }
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return undefined;
  }
}
