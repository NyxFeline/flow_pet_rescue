import { Module } from "@nestjs/common";
import { SosController } from "./sos.controller";
import { SosService } from "./sos.service";
import { SosGateway } from "./sos.gateway";
import { PrismaModule } from "src/prisma/prisma.module";
import { NotificationModule } from "../notification/notification.module";
import { RolesGuard } from "../auth/guards/roles.guard";

@Module({
    imports: [PrismaModule, NotificationModule],
    controllers: [SosController],
    providers: [SosService, SosGateway, RolesGuard],
    exports: [SosService, SosGateway, NotificationModule]
})
export class SosModule {}