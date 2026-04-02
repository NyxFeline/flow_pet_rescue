import {
    Controller,
    Get,
    Patch,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    findAll(
        @GetUser('userId') userId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.notificationService.findByUser(userId, +page, +limit);
    }

    @Patch('read-all')
    markAllRead(@GetUser('userId') userId: string) {
        return this.notificationService.markAllRead(userId);
    }

    @Patch(':id/read')
    markRead(
        @Param('id') id: string,
        @GetUser('userId') userId: string,
    ) {
        return this.notificationService.markRead(id, userId);
    }
}