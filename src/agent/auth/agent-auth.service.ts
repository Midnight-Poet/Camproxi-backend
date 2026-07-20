import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AgentAuthService {
  private readonly jwtSecret = process.env.AGENT_JWT_TOKEN || 'supersecret';

  generateToken(agentId: string, email: string, category: string): string {
    return jwt.sign({ agentId, email, category }, this.jwtSecret, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
