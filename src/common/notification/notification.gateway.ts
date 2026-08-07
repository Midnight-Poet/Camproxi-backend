import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { RecipientType } from '@prisma/client';
import { forwardRef, Inject } from '@nestjs/common';
import { authenticateSocket } from '../utils/socket-auth.util';


interface ConnectedClient {
  socketIds: Set<string>;
  role: RecipientType;
}

@WebSocketGateway({
  cors: {
    origin: [
			process.env.AGENT_URL || 'http://localhost:5173',
			process.env.STUDENT_URL || 'http://localhost:5174',
      process.env.ADMIN_URL || 'http://localhost:5175',
		],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map of userId -> all active socket connections for that user + their role.
  // A Set is used instead of a single socketId so a user with multiple tabs
  // or devices open still gets notifications on all of them.
  private connectedClients = new Map<string, ConnectedClient>();

  // Reverse lookup so handleDisconnect / handleMarkAsRead don't need to
  // scan every entry in connectedClients on every event.
  private socketToUser = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    const auth = await authenticateSocket(client, this.jwtService);
    if (!auth) {
      client.disconnect();
      return;
    }

    const { userId, role } = auth;

    const existing = this.connectedClients.get(userId);
    if (existing) {
      existing.socketIds.add(client.id);
    } else {
      this.connectedClients.set(userId, {
        socketIds: new Set([client.id]),
        role,
      });
    }
    this.socketToUser.set(client.id, userId);

    console.log(`Notification Client connected: ${userId} (${role})`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    this.socketToUser.delete(client.id);

    const entry = this.connectedClients.get(userId);
    if (!entry) return;

    entry.socketIds.delete(client.id);
    if (entry.socketIds.size === 0) {
      this.connectedClients.delete(userId);
    }

    console.log(`Notification Client disconnected: ${userId}`);
  }

  // Called by NotificationService when a new notification is created.
  // Emits to every active connection for this user (all tabs/devices).
  sendRealTimeNotification(recipientId: string, notification: any) {
    const entry = this.connectedClients.get(recipientId);
    if (!entry) return;

    entry.socketIds.forEach((socketId) => {
      this.server.to(socketId).emit('newNotification', notification);
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { notificationId: string },
  ) {
    try {
      const userId = this.socketToUser.get(client.id);
      if (!userId || !payload.notificationId) return;

      await this.notificationService.markAsRead(payload.notificationId, userId);

      this.server.to(client.id).emit('notificationRead', {
        notificationId: payload.notificationId,
      });
    } catch (error) {
      console.error('Error marking notification as read via socket:', error);
    }
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    try {
      const userId = this.socketToUser.get(client.id);
      if (!userId) return;

      const role = this.connectedClients.get(userId)?.role;
      if (!role) return;

      await this.notificationService.markAllAsRead(userId, role);

      this.server.to(client.id).emit('allNotificationsRead', { success: true });
    } catch (error) {
      console.error('Error marking all notifications as read via socket:', error);
    }
  }
}
