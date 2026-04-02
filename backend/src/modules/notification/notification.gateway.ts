import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class NotificationGateway implements OnGatewayConnection {
    @WebSocketServer()
    server!: Server;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    async handleConnection(client: Socket) {
        try {
            const token = (client.handshake.auth?.token as string) || (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
            });

            const userId: string = payload.sub;
            client.data.userId = userId;

            // Join room riêng của user
            client.join(`user:${userId}`);
        } catch {
            client.disconnect();
        }
    }
}