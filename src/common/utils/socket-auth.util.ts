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
  if (!authCookie) return null;

  const cookies = authCookie.split(';').reduce((acc, cookieStr) => {
    const [key, value] = cookieStr.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const origin = client.handshake.headers.origin || client.handshake.headers.referer || '';
  const agentUrl = process.env.AGENT_URL || 'http://localhost:5173';
  console.log(`[WebSocket] Auth Handshake - Origin: ${client.handshake.headers.origin}, Referer: ${client.handshake.headers.referer}`);

  try {
    // If the connection comes from the Agent portal, prioritize the Agent's 'jwt' cookie
    if (origin === agentUrl || origin.includes('5173')) {
      if (cookies['jwt']) {
        const decoded = jwt.verify(
          cookies['jwt'],
          process.env.AGENT_JWT_TOKEN as string,
        ) as any;
        const userId = decoded.agentId;
        if (!userId) return null;
        return { userId, role: RecipientType.AGENT };
      }
    }

    // Otherwise, check for the 'access_token' (used by Student and Admin)
    if (cookies['access_token']) {
      const decoded = await jwtService.verifyAsync(cookies['access_token']);
      const userId = decoded.sub;
      const role = decoded.role ? RecipientType.ADMIN : RecipientType.STUDENT;
      if (!userId) return null;
      return { userId, role };
    }

    // Fallback if the agent is connecting but didn't match the exact origin string above
    if (cookies['jwt']) {
      const decoded = jwt.verify(
        cookies['jwt'],
        process.env.AGENT_JWT_TOKEN as string,
      ) as any;
      const userId = decoded.agentId;
      if (!userId) return null;
      return { userId, role: RecipientType.AGENT };
    }

    return null;
  } catch {
    // invalid/expired token, malformed cookie, etc.
    return null;
  }
}
