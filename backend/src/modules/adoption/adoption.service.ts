import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AdoptionService {
    constructor(private prisma: PrismaService) {}

    // Người dùng có thể xin nhận nuôi một con vật nếu nó đang có trạng thái "available"
    async applyForAdoption(userId: string, petId: string, applicationData: any) {
        const pet = await this.prisma.pet.findUnique({ where: { id: petId } });

        if (!pet) {
            throw new BadRequestException("Pet not found");
        }
        if (pet.status !== "available") {
            throw new ForbiddenException("Pet is not available for adoption");
        }

        return this.prisma.adoptionApplication.create ({
            data: {
                pet_id: petId,
                adopter_id: userId,
                application_data: applicationData,
                status: "pending",
            },
        })
    }

    // Người dùng có thể xem tất cả đơn xin nhận nuôi của mình
    async myApplications(userId: string) {
        return this.prisma.adoptionApplication.findMany({
            where: { adopter_id: userId },
            include: { pet: true },
            orderBy: { created_at: "desc" },
        });
    }

    // Chỉ chủ trại hoặc admin mới có thể xem các đơn xin nhận nuôi cho một con vật cụ thể
    async applicationsByPet(userId: string, role: string, petId: string ){
        const pet = await this.prisma.pet.findUnique({ where: { id: petId } });

        if (!pet) {
            throw new BadRequestException("Pet not found");
        }
        if (pet.shelter_id !== userId && role !== "admin") {
            throw new ForbiddenException("You do not have permission to view applications for this pet");
        }

        return this.prisma.adoptionApplication.findMany({
            where: { pet_id: petId },
            include: { adopter: true }, // Để lấy thông tin người xin nhận nuôi
            orderBy: { created_at: "desc" },
        });
    }

    async updateStatus(userId: string, role: string, applicationId: string, status: "interview" | "approved" | "rejected") {
        const app = await this.prisma.adoptionApplication.findUnique({ where: { id: applicationId }, include: { pet: true } });

        if (!app) {
            throw new BadRequestException("Application not found");
        }
        if (app.pet.shelter_id !== userId && role !== "admin") {
            throw new ForbiddenException("You do not have permission to update this application");
        }
        if(app.status == "pending" && status !== "interview") {
            throw new ForbiddenException("You can only move to interview stage from pending");
        }
        if(app.status == "interview" && !["approved", "rejected"].includes(status)) {
            throw new ForbiddenException("You can only approve or reject an application that is in the interview stage");
        }

        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.adoptionApplication.update({
                where: { id: applicationId },
                data: { status }
            });

            if (status === "approved"){
                await tx.pet.update({
                    where: { id: app.pet_id},
                    data: { status: "adopted"}
                });

                await tx.adoptionApplication.updateMany({
                    where: { pet_id: app.pet_id, id: { not: applicationId }},
                    data: { status: "rejected"}
                });
            }

            return updated;
        })
    }
}