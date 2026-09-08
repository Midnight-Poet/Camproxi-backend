import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AgentAuthService {
  private readonly jwtSecret = process.env.AGENT_JWT_TOKEN || process.env.JWT_TOKEN_SECRET || 'camproxi-agent-secret-key';

  generateToken(agentId: string, email: string, category: string, schoolId: string, campusName: string): string {
    return jwt.sign(
      { agentId, email, category, schoolId, campusName, portal: 'AGENT' },
      this.jwtSecret,
      { expiresIn: '2d' },
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
