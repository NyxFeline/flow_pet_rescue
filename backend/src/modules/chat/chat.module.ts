import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    imports: [PrismaModule, JwtModule],
    controllers: [ChatController],
    providers: [ChatService, ChatGateway],
})
export class ChatModule {}