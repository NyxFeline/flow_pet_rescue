import {
    Controller, Get, Post, Param, Body,
    UseGuards, Query
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateDirectDto } from './dto/createDirect.dto';

@Controller('chat')
@UseGuards(JwtGuard)
export class ChatController {
    constructor(private chatService: ChatService) {}

    // POST /chat/conversations — tạo hoặc lấy conversation với người khác
    @Post('conversations')
    async createOrGet(
        @GetUser('userId') userId: string,
        @Body() dto: CreateDirectDto,
    ) {
        return this.chatService.getOrCreateConversation(userId, dto.targetUserId);
    }

    // GET /chat/conversations — list tất cả conversation của current user
    @Get('conversations')
    async listConversations(@GetUser('userId') userId: string) {
        return this.chatService.getConversationsByUser(userId);
    }

    // GET /chat/conversations/:id/messages — load tin nhắn (có pagination)
    @Get('conversations/:id/messages')
    async getMessages(
        @Param('id') conversationId: string,
        @GetUser('userId') userId: string,
        @Query('cursor') cursor?: string,
        @Query('take') take?: string,
    ) {
        return this.chatService.getMessages(
            conversationId,
            userId,
            cursor,
            take ? parseInt(take) : 20,
        );
    }
}