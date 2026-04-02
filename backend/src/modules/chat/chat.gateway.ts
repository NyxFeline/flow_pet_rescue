import { WebSocketGateway, WebSocketServer, SubscribeMessage, ConnectedSocket, MessageBody } from "@nestjs/websockets";
import { ChatService } from "./chat.service";
import { Server, Socket } from "socket.io";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { JwtService } from "@nestjs/jwt/dist/jwt.service";

@WebSocketGateway({ cors: { origin: "*" } })
export class ChatGateway {
    @WebSocketServer() server!: Server;

    constructor(private chatService: ChatService, private jwtService: JwtService, private configService: ConfigService) {}

    handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(" ")[1];

            if (!token) 
                throw new Error("No token");

            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
            });

            client.data.userId = payload.sub;
        } catch {
            client.disconnect();
        }
    }

    @SubscribeMessage("chat:join")
    async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string }) {
        try {
            const userId = client.data.userId;

            const isMember = await this.chatService.isUserInConversation(
                userId,
                body.conversationId
            );

            if (!isMember) {
                client.emit("chat:error", { message: "Not allowed" });
                return;
            }

            const room = `conversation:${body.conversationId}`;

            //chống spam join cùng room
            if (client.rooms.has(room)) return;

            client.join(room);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            client.emit("chat:error", { message });
        }
    }

    @SubscribeMessage("chat:send")
    async sendMessage(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string; senderId: string; content: string }) {
        try {
            const { conversationId, content } = body;

            const senderId = client.data.userId;

            if (!content?.trim()) {
                client.emit("chat:error", { message: "Content cannot be empty" });
                return;
            }

            const message = await this.chatService.sendMessage(
                conversationId,
                senderId,
                content
            );

            const room = `conversation:${conversationId}`;

            //sender nhận phản hồi ngay, không cần chờ broadcast
            client.emit("chat:sent", message);

            // Broadcast cho các thành viên còn lại trong room
            client.to(room).emit("chat:message", message);
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            client.emit("chat:error", { message });
        }
    }

    @SubscribeMessage("chat:read")
    async markRead(@ConnectedSocket() client: Socket, @MessageBody() body: { conversationId: string }) {
        try {
            const { conversationId } = body;

            const userId = client.data.userId;

            await this.chatService.markRead(conversationId, userId);

            const room = `conversation:${conversationId}`;
            this.server.to(room).emit("chat:read", {
                conversationId,
                userId,
                timestamp: new Date().toISOString(),
            });
        } catch (e) {
            const message = e instanceof Error ? e.message : "Unknown error";
            client.emit("chat:error", { message });
        }
    }
}