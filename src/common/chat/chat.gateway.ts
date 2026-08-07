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
import { RecipientType } from '@prisma/client';
import { authenticateSocket } from '../utils/socket-auth.util';
import { PrismaService } from '../prisma/prisma.service';

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
	namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	server: Server;

	private connectedClients = new Map<string, ConnectedClient>();
	private socketToUser = new Map<string, string>();

	constructor(
		private readonly chatService: ChatService,
		private readonly jwtService: JwtService,
		private readonly prisma: PrismaService,
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

		console.log(`Client disconnected: ${userId}`);
	}

	@SubscribeMessage('joinChat')
	async handleJoinChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { chatId: string },
	) {
		try {
			const userId = this.socketToUser.get(client.id);
			if (!userId) return;

			// SECURITY: Verify the user is a participant of this chat
			const chat = await this.prisma.chat.findUnique({
				where: { id: payload.chatId },
			});

			if (!chat) return;

			if (chat.studentId !== userId && chat.agentId !== userId) {
				console.warn(`[SECURITY] User ${userId} attempted to join unauthorized chat ${payload.chatId}`);
				return;
			}

			client.join(payload.chatId);
		} catch (error) {
			console.error('Error in handleJoinChat:', error);
		}
	}

	@SubscribeMessage('sendMessage')
	async handleSendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: SendMessageDto,
	) {
		try {
			const message = await this.chatService.saveMessage(payload);

			// Broadcast the message to all users in the chat room (all their
			// connected tabs/devices are already in the room via joinChat).
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
			const userId = this.socketToUser.get(client.id);
			if (!userId) return;

			const role = this.connectedClients.get(userId)?.role;
			if (role !== RecipientType.STUDENT && role !== RecipientType.AGENT)
				return;

			await this.chatService.markMessagesAsRead(
				payload.chatId,
				userId,
				role,
			);

			// Notify everyone in the chat room that messages were read
			this.server.to(payload.chatId).emit('messagesRead', {
				chatId: payload.chatId,
				readBy: role,
				readerId: userId,
			});
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}
	}

	@SubscribeMessage('deleteMessage')
	async handleDeleteMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() payload: { messageId: string; chatId: string },
	) {
		try {
			const userId = this.socketToUser.get(client.id);
			if (!userId) return;

			await this.chatService.deleteMessage(payload.messageId, userId);

			// Broadcast the deletion so both parties remove it from UI
			this.server.to(payload.chatId).emit('messageDeleted', {
				messageId: payload.messageId,
				chatId: payload.chatId,
			});
		} catch (error) {
			console.error('Error deleting message:', error);
		}
	}
}
