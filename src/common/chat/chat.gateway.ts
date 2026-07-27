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
import { ChatService, SendMessageDto } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat'
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, { socketId: string, role: 'STUDENT' | 'AGENT' }>();

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authCookie = client.handshake.headers.cookie;
      if (!authCookie) {
        client.disconnect();
        return;
      }

      const cookies = authCookie.split(';').reduce((acc, cookieStr) => {
        const [key, value] = cookieStr.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      let userId = null;
      let role: 'STUDENT' | 'AGENT' | null = null;

      // Try Student (access_token via nestjs/jwt)
      if (cookies['access_token']) {
        const decoded = await this.jwtService.verifyAsync(cookies['access_token']);
        userId = decoded.sub;
        role = 'STUDENT';
      } 
      // Try Agent (jwt via jsonwebtoken)
      else if (cookies['jwt']) {
        const decoded = jwt.verify(cookies['jwt'], process.env.AGENT_JWT_TOKEN as string) as any;
        userId = decoded.agentId;
        role = 'AGENT';
      }

      if (!userId || !role) {
        client.disconnect();
        return;
      }

      // Store connected client
      this.connectedClients.set(userId, { socketId: client.id, role });
    } catch (error) {
      console.log('Socket connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, data] of this.connectedClients.entries()) {
      if (data.socketId === client.id) {
        this.connectedClients.delete(userId);
        console.log(`Client disconnected: ${userId}`);
        break;
      }
    }
  }

  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string },
  ) {
    client.join(payload.chatId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ) {
    try {
      const message = await this.chatService.saveMessage(payload);
      
      // Broadcast the message to all users in the chat room
      this.server.to(payload.chatId).emit('newMessage', message);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string },
  ) {
    try {
      let userId: string | null = null;
      let role: 'STUDENT' | 'AGENT' | null = null;

      // Find user from connected clients
      for (const [id, data] of this.connectedClients.entries()) {
        if (data.socketId === client.id) {
          userId = id;
          role = data.role;
          break;
        }
      }

      if (!userId || !role) return;

      await this.chatService.markMessagesAsRead(payload.chatId, userId, role);
      
      // Notify everyone in the chat room that messages were read
      this.server.to(payload.chatId).emit('messagesRead', { 
        chatId: payload.chatId,
        readBy: role,
        readerId: userId
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }
}
