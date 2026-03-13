import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SosService } from "./sos.service";

@WebSocketGateway({
    cors: { origin: "*" },
})
export class SosGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly sosService: SosService) {}

    @SubscribeMessage("sos:join")
    handleJoin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const { sosId } = data;
        if (!sosId) return;
        client.join(`sos:${sosId}`);
    }

    @SubscribeMessage("sos:tracking")
    async handleTracking(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        const { sosId, lat, lng } = data;

        if (!sosId || lat === undefined || lng === undefined) {
            client.emit("sos:error", { message: "Invalid data" });
            return;
        }

        const sos = await this.sosService.findById(sosId);
        if (sos.status !== 'in_progress') {
            client.emit("sos:error", { message: "Tracking only allowed for in_progress SOS" });
            return;
        }

        this.server.to(`sos:${sosId}`).emit("sos:tracking", { sosId, lat, lng });
    }
}