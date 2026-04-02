import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
    constructor(
        private prisma: PrismaService,
        private notificationGateway: NotificationGateway,
    ) {}

    async create(userId: string, type: NotificationType, payload: object) {
        const notification = await this.prisma.notification.create({
            data: {
                user_id: userId,
                type,
                payload,
            },
        });

        // Emit realtime tới room của user
        this.notificationGateway.server
            .to(`user:${userId}`)
            .emit('notification:new', notification);

        return notification;
    }

    async findByUser(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({ where: { user_id: userId } }),
        ]);

        return { data, total, page, limit };
    }

    async markRead(notificationId: string, userId: string) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, user_id: userId },
            data: { is_read: true },
        });
    }

    async markAllRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true },
        });
    }
}