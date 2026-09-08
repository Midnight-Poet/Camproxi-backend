import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { RecipientType } from '@prisma/client';

export interface SocketAuthResult {
  userId: string;
  role: RecipientType;
}

/**
 * Parses the auth cookie off a socket handshake and verifies it against
 * either the NestJS JwtService (Admin/Student) or the Agent's separate
 * jsonwebtoken-based token. Returns null if there's no valid session.
 */
export async function authenticateSocket(
  client: Socket,
  jwtService: JwtService,
): Promise<SocketAuthResult | null> {
  const authCookie = client.handshake.headers.cookie;
  const cookies: Record<string, string> = authCookie
    ? authCookie.split(';').reduce((acc, cookieStr) => {
        const [key, value] = cookieStr.trim().split('=');
        if (key && value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>)
    : {};

  const tokenFromAuth =
    (client.handshake.auth && (client.handshake.auth.token || client.handshake.auth.access_token)) ||
    (client.handshake.headers['authorization']?.startsWith('Bearer ')
      ? client.handshake.headers['authorization'].split(' ')[1]
      : undefined);

  const agentSecret =
    process.env.AGENT_JWT_TOKEN || process.env.JWT_TOKEN_SECRET || 'camproxi-agent-secret-key';

  try {
    // 1. Check for Agent's 'jwt' cookie or auth token
    const agentToken = cookies['jwt'] || (client.handshake.auth?.role === 'AGENT' ? tokenFromAuth : undefined);
    if (agentToken) {
      try {
        const decoded = jwt.verify(agentToken, agentSecret) as any;
        const userId = decoded.agentId || decoded.sub;
        if (userId) {
          return { userId, role: RecipientType.AGENT };
        }
      } catch {
        // Fall through to try standard access_token
      }
    }

    // 2. Check for 'access_token' (used by Student and Admin) or handshake token
    const accessToken = cookies['access_token'] || tokenFromAuth;
    if (accessToken) {
      const decoded = await jwtService.verifyAsync(accessToken);
      const userId = decoded.sub;
      if (!userId) return null;

      if (decoded.portal === 'ADMIN' || decoded.role) {
        return { userId, role: RecipientType.ADMIN };
      }
      if (decoded.portal === 'AGENT' || decoded.agentId) {
        return { userId, role: RecipientType.AGENT };
      }
      return { userId, role: RecipientType.STUDENT };
    }

    return null;
  } catch {
    return null;
  }
}
