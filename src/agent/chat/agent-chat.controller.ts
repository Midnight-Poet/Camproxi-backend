import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ChatService } from 'src/common/chat/chat.service';
import { AgentAuthGuard } from '../auth/agent-auth.guard';

@Controller('api/agent/chats')
@UseGuards(AgentAuthGuard)
export class AgentChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMyChats(@Req() req: any) {
    return this.chatService.getAgentChats(req.agent.id);
  }

  @Get(':chatId')
  async getChatById(@Param('chatId') chatId: string) {
    return this.chatService.getChatById(chatId);
  }

  @Post('initiate')
  async initiateChat(
    @Req() req: any, 
    @Body() body: { studentId: string, itemId?: string, itemCategory?: string }
  ) {
    return this.chatService.getOrCreateChat({
      agentId: req.agent.id,
      studentId: body.studentId,
      itemId: body.itemId,
      itemCategory: body.itemCategory,
    });
  }

  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query('limit') limit: string,
    @Query('skip') skip: string,
  ) {
    return this.chatService.getChatMessages(
      chatId, 
      limit ? parseInt(limit, 10) : 50, 
      skip ? parseInt(skip, 10) : 0
    );
  }

  @Patch(':chatId/read')
  async markAsRead(@Req() req: any, @Param('chatId') chatId: string) {
    await this.chatService.markMessagesAsRead(chatId, req.agent.id, 'AGENT');
    return { message: 'Messages marked as read' };
  }
}
