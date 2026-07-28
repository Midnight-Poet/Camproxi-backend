import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import {
	RecipientType,
	NotificationCat,
	NotificationType,
} from '@prisma/client';

export interface SendMessageDto {
	chatId: string;
	senderId: string;
	senderType: 'STUDENT' | 'AGENT';
	content: string;
}

export interface CreateChatDto {
	studentId: string;
	agentId: string;
	itemId?: string;
	itemCategory?: string;
}

@Injectable()
export class ChatService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly notificationService: NotificationService,
	) {}

	async getOrCreateChat(data: CreateChatDto) {
		let chat = await this.prisma.chat.findFirst({
			where: {
				studentId: data.studentId,
				agentId: data.agentId,
				itemId: data.itemId || null,
			},
		});

		if (!chat) {
			chat = await this.prisma.chat.create({
				data: {
					studentId: data.studentId,
					agentId: data.agentId,
					itemId: data.itemId || null,
					itemCategory: data.itemCategory || null,
				},
			});
		}
		return chat;
	}

	async getChatById(chatId: string) {
		const chat = await this.prisma.chat.findUnique({
			where: { id: chatId },
			include: {
				student: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						profileImage: true,
					},
				},
				agent: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						companyName: true,
						profileImage: true,
					},
				},
			},
		});
		if (!chat) throw new NotFoundException('Chat not found');
		return chat;
	}

	async getStudentChats(studentId: string) {
		try {
			const messages = await this.prisma.chat.findMany({
				where: { studentId },
				include: {
					agent: {
						select: {
							id: true,
							firstName: true,
							lastName: true,
							companyName: true,
							profileImage: true,
						},
					},
					messages: {
						orderBy: { createdAt: 'desc' },
						take: 1,
					},
				},
				orderBy: { updatedAt: 'desc' },
			});
			return messages;
		} catch (error) {
			throw new BadRequestException();
		}
	}

	async getAgentChats(agentId: string) {
		return this.prisma.chat.findMany({
			where: { agentId },
			include: {
				student: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						profileImage: true,
					},
				},
				messages: {
					orderBy: { createdAt: 'desc' },
					take: 1,
				},
			},
			orderBy: { updatedAt: 'desc' },
		});
	}

	async getChatMessages(chatId: string, limit = 50, skip = 0) {
		return this.prisma.message.findMany({
			where: { chatId },
			orderBy: { createdAt: 'desc' },
			take: limit,
			skip,
		});
	}

	async saveMessage(data: SendMessageDto) {
		const message = await this.prisma.message.create({
			data: {
				chatId: data.chatId,
				senderId: data.senderId,
				senderType: data.senderType,
				content: data.content,
			},
		});

		// Update the chat's updatedAt field
		const chat = await this.prisma.chat.update({
			where: { id: data.chatId },
			data: { updatedAt: new Date() },
		});

		// Trigger Notification
		const recipientId =
			data.senderType === 'STUDENT' ? chat.agentId : chat.studentId;
		const recipientType =
			data.senderType === 'STUDENT'
				? RecipientType.AGENT
				: RecipientType.STUDENT;

		// We can fetch the sender name if needed, but for simplicity we'll just say "New message received"
		await this.notificationService.createNotification({
			recipientId,
			recipientType,
			title: 'New Message',
			message: `You have received a new message`,
			category: NotificationCat.NEW_MESSAGE,
			type: NotificationType.INFO,
		});

		return message;
	}

	async markMessagesAsRead(
		chatId: string,
		recipientId: string,
		recipientType: 'STUDENT' | 'AGENT',
	) {
		// If recipient is STUDENT, mark messages sent by AGENT as read
		const senderType = recipientType === 'STUDENT' ? 'AGENT' : 'STUDENT';

		await this.prisma.message.updateMany({
			where: {
				chatId,
				senderType,
				isRead: false,
			},
			data: { isRead: true },
		});
	}
}
