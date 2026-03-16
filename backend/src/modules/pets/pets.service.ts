import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreatePetDto } from "./dto/createPet.dto";
import { FindPetsQueryDto } from "./dto/findPetsQuery.dto";
import { UpdatePetDto } from "./dto/updatePet.dto";

@Injectable()
export class PetsService {
    constructor(private prisma: PrismaService) {}

    async create (userId: string, dto: CreatePetDto) {
        const pet = await this.prisma.pet.create({
            data: {
                shelter_id: userId,
                name: dto.name,
                species: dto.species,
                age: dto.age,
                gender: dto.gender,
                is_vaccinated: dto.is_vaccinated,
                description: dto.description,
                images: dto.images ?? [], // Chắc chắn rằng images luôn là một mảng, ngay cả khi không được cung cấp
            }
        });
        return pet;
    }

    async findAll(query: FindPetsQueryDto) {
        const { species, minAge, maxAge, is_vaccinated, status, page = 1, limit = 10 } = query;
        const where: any = {};

        if (species) 
            where.species = species;
        if (status)
            where.status = status;
        if (is_vaccinated !== undefined)
            where.is_vaccinated = is_vaccinated;
        if (minAge || maxAge) {
            where.age = {};
            if (minAge)
                where.age.gte = minAge;
            if (maxAge)
                where.age.lte = maxAge;
        }

        const skip = (page - 1) * limit;

        const [pets, total] = await Promise.all([
            this.prisma.pet.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" }
            }),
            this.prisma.pet.count({ where })
        ]);
        return { data: pets, page, limit, total };
    }

    async findById(id: string) {
        const pet = await this.prisma.pet.findUnique({ where: { id } });

        if (!pet) {
            throw new NotFoundException("Pet not found");
        }

        return pet;
    }

    async update(userId: string, role: string, petId: string, dto: UpdatePetDto) {
        const pet = await this.findById(petId);

        if (pet.shelter_id !== userId && role !== "admin") {
            throw new ForbiddenException("You do not have permission to update this pet");
        }

        return this.prisma.pet.update({ where: { id: petId }, data: dto });
    }

    async delete(userId: string, role: string, petId: string) {
        const pet = await this.findById(petId);

        if (pet.shelter_id !== userId && role !== "admin") {
            throw new ForbiddenException("You do not have permission to delete this pet");
        }

        const activeApps = await this.prisma.adoptionApplication.count({
            where: {
                pet_id: petId,
                status: { in: ['pending', 'interview']}
            }
        })

        if (activeApps > 0)
            throw new BadRequestException('Cannot delete pet with active adoption applications');

        return this.prisma.pet.delete({ where: { id: petId } });
    }
}