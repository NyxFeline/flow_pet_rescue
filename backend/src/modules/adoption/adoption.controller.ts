import { Controller, Post, Get, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { AdoptionService } from "./adoption.service";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";
import { UpdateAdoptionStatusDto } from "./dto/updateAdoptionStatus.dto";

@Controller("adoption")
export class AdoptionController {
    constructor(private readonly adoptionService: AdoptionService) {}

    @Post(":petId/apply")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("user")
    async update (@Param("petId") petId: string, @GetUser("userId") userId: string, @Body() body: any){
        return this.adoptionService.applyForAdoption(userId, petId, body);
    }

    @Get("my-applications")
    @UseGuards(JwtGuard)
    async myApplications (@GetUser("userId") userId: string) {
        return this.adoptionService.myApplications(userId);
    }

    @Get("pet/:petId")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("rescuer", 'admin')
    async applicationByPet (@Param("petId") petId: string, @GetUser("userId") userId: string, @GetUser("role") role: string){
        return this.adoptionService.applicationsByPet(userId, role, petId);
    }

    @Patch(":id/status")
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("rescuer", "admin")
    async updateStatus(@Param("id") id: string, @GetUser("userId") userId: string, @GetUser("role") role: string, @Body() dto: UpdateAdoptionStatusDto){
        return this.adoptionService.updateStatus(userId, role, id, dto.status);
    }
    
}