import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards } from "@nestjs/common";
import { SosService } from "./sos.service";
import { CreateSosDto } from "./dto/CreateSos.dto";
import { NearbyQueryDto } from "./dto/NearbyQuery.dto";
import { UpdateSosStatusDto } from "./dto/UpdateSosStatus.dto";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";

@Controller("sos")
export class SosController {
    constructor(private readonly sosService: SosService) {}

    @Post()
    @UseGuards(JwtGuard)
    create(@GetUser("userId") userId: string, @Body() dto: CreateSosDto) {
        return this.sosService.create(userId, dto);
    }

    @Get("nearby")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("rescuer")
    findNearby(@Query() query: NearbyQueryDto) {

        const { lat, lng, radius } = query;

        return this.sosService.findNearby(
            lat,
            lng,
            radius ?? 5000
        );
    }

    @Patch(":id/accept")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("rescuer")
    accept( @Param("id") id: string, @GetUser("userId") userId: string) {
        return this.sosService.accept(id, userId);
    }

    @Patch(":id/status")
    @UseGuards(JwtGuard)
    updateStatus(@Param("id") id: string, @Body() dto: UpdateSosStatusDto) {
        return this.sosService.updateStatus(id, dto.status);
    }

    @Get(":id")
    findById(@Param("id") id: string) {
        return this.sosService.findById(id);
    }
}