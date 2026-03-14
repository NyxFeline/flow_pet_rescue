import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PetsService } from "./pets.service";
import { CreatePetDto } from "./dto/createPet.dto";

import { JwtGuard } from "../auth/guards/jwt.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { GetUser } from "../auth/decorators/get-user.decorator";

import { Get, Query, Param, Patch, Delete } from "@nestjs/common";
import { FindPetsQueryDto } from "./dto/findPetsQuery.dto";
import { UpdatePetDto } from "./dto/updatePet.dto";

@Controller("pets")
export class PetsController {
    constructor(private readonly petsService: PetsService) {}

    @Post()
    @UseGuards(JwtGuard, RolesGuard)
    @Roles("rescuer")
    async create(@GetUser("userId") userId: string, @Body() dto: CreatePetDto) {
        return this.petsService.create(userId, dto);
    }

    @Get(":id")
    async findById(@Param("id") id: string) {
        return this.petsService.findById(id);
    }

    @Get()
    async findAll(@Query() query: FindPetsQueryDto) {
        return this.petsService.findAll(query);
    }

    @Patch(":id")
    @UseGuards(JwtGuard)
    async update (@Param("id") petId: string, @Body() dto: UpdatePetDto, @GetUser("userId") userId: string, @GetUser("role") role: string) {
        return this.petsService.update(userId, role, petId, dto);
    }

    @Delete(":id")
    @UseGuards(JwtGuard)
    async delete (@Param("id") petId: string, @GetUser("userId") userId: string, @GetUser("role") role: string){
        return this.petsService.delete(userId, role, petId);
    }
}