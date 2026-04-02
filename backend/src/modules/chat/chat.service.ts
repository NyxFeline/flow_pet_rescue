import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class ChatService{
    constructor(
        private prisma: PrismaService,
        private notificationService: NotificationService,
    ) {}

    private async findConversationWithParticipants(conversationId: string) {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true }
        });

        if (!conv) 
            throw new NotFoundException("Conversation not found");
        return conv;
    }

    async isUserInConversation(userId: string, conversationId: string): Promise<boolean> {
        const conv = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { participants: true }
        });

        if (!conv) 
            return false; // không throw — Gateway tự xử lý
        return conv.participants.some(p => p.user_id === userId);
    }

    async getOrCreateConversation(userId_1: string, userId_2: string) {
        const existing = await this.prisma.conversation.findMany({
            where: {
                AND: [
                    { participants: { some: { user_id: userId_1 } } },
                    { participants: { some: { user_id: userId_2 } } },
                ],
            },
            include: { participants: true },
        });

        const direct = existing.find(c => c.participants.length === 2);

        if (direct) return direct;

        return this.prisma.conversation.create({
            data: {
                created_by: userId_1,
                participants: {
                    create: [
                        { user_id: userId_1 },
                        { user_id: userId_2 },
                    ]
                }
            },
            include: { participants: true }
        });
    }

    async getConversationsByUser(userId: string) {
        return this.prisma.conversation.findMany({
            where: {
                participants: { some: { user_id: userId } }
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, full_name: true, avatar_url: true } }
                    }
                },
                messages: {
                    orderBy: { created_at: 'desc' },
                    take: 1, // chỉ lấy tin nhắn mới nhất để preview
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    async getMessages(
        conversationId: string,
        userId: string,
        cursor?: string,
        take = 20,
    ) {
        // Kiểm tra user có trong conversation không
        const isMember = await this.isUserInConversation(userId, conversationId);
        if (!isMember)
            throw new ForbiddenException('You are not a member of this conversation');

        const messages = await this.prisma.message.findMany({
            where: { conversation_id: conversationId },
            orderBy: { created_at: 'desc' }, // mới nhất trước
            take: take + 1,                  // lấy thêm 1 để biết còn trang sau không
            ...(cursor && {
                cursor: { id: cursor },
                skip: 1, // bỏ chính cái cursor đó
            }),
            include: {
                sender: { select: { id: true, full_name: true, avatar_url: true } }
            }
        });

        // Nếu lấy được nhiều hơn take → còn trang sau
        const hasMore = messages.length > take;
        const data = hasMore ? messages.slice(0, take) : messages;

        return {
            data,
            nextCursor: hasMore ? data[data.length - 1].id : null,
        };
    }
    
    async sendMessage(conversationId: string, senderId: string, content: string) {
        if (content.trim().length === 0)
            throw new BadRequestException("Message content cannot be empty");

        // 1. Lấy conversation (đã có participants)
        const conv = await this.findConversationWithParticipants(conversationId);

        // 2. Check quyền
        const isMember = conv.participants.some(p => p.user_id === senderId);
        if (!isMember)
            throw new ForbiddenException("You are not a member of this conversation");

        // 3. Lưu message
        const message = await this.prisma.message.create({
            data: {
                conversation_id: conversationId,
                sender_id: senderId,
                content,
            },
            include: {
                sender: {
                    select: { id: true, full_name: true, avatar_url: true }
                }
            }
        });

        // 4. Notify recipients
        const recipients = conv.participants
            .filter(p => p.user_id !== senderId)
            .map(p => p.user_id);

        await Promise.all(
            recipients.map((recipientId) =>
                this.notificationService.create(recipientId, 'chat_message', {
                    conversationId,
                    senderId,
                    preview: content.slice(0, 100),
                }),
            ),
        );

        return message;
    }

    async markRead(conversationId: string, userId: string){
        const conv = await this.findConversationWithParticipants(conversationId);

        const isMember = conv.participants.some(p => p.user_id === userId);
        if (!isMember)
            throw new ForbiddenException("You are not a member of this conversation");

        return this.prisma.message.updateMany({
            where: {
                conversation_id: conversationId,
                sender_id: { not: userId },
                is_read: false,
            },
            data: { is_read: true }
        });
    }

}