import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ChatService } from 'src/common/chat/chat.service';
import { StudentAuthGuard } from '../auth/guards/student-auth.guard';

@Controller('api/student/chats')
@UseGuards(StudentAuthGuard)
export class StudentChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  async getMyChats(@Req() req: any) {
    return this.chatService.getStudentChats(req.user.sub);
  }

  @Get(':chatId')
  @UseInterceptors(CacheInterceptor)
  async getChatById(@Param('chatId') chatId: string) {
    return this.chatService.getChatById(chatId);
  }

  @Post('initiate')
  async initiateChat(
    @Req() req: any, 
    @Body() body: { agentId: string, itemId?: string, itemCategory?: string }
  ) {
    // console.log(body)
    return this.chatService.getOrCreateChat({
      studentId: req.user.sub,
      agentId: body.agentId,
      itemId: body.itemId,
      itemCategory: body.itemCategory,
    });
  }

  @Get(':chatId/messages')
  @UseInterceptors(CacheInterceptor)
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
    await this.chatService.markMessagesAsRead(chatId, req.user.sub, 'STUDENT');
    return { message: 'Messages marked as read' };
  }
}
