import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { CreateSosDto } from "./dto/CreateSos.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { NotificationGateway } from "../notification/notification.gateway";
import { SosStatus } from '@prisma/client';
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class SosService {
    constructor(
        private prisma: PrismaService,
        private notificationGateway: NotificationGateway,
        private notificationService: NotificationService, // thêm
    ) {}

    // Tạo SOS mới
    async create(userId: string, dto: CreateSosDto) {
        const { latitude, longitude, description, images } = dto;

        // validate coordinates
        if (latitude < -90 || latitude > 90) {
            throw new BadRequestException('Invalid latitude value');
        }
        if (longitude < -180 || longitude > 180) {
            throw new BadRequestException('Invalid longitude value');
        }

        // insert SOS bằng PostGIS query
        const resultSos= await this.prisma.$queryRaw<any>`

            INSERT INTO "SosReport"
            (id, reporter_id, images, description, location, status)

            VALUES (
                gen_random_uuid(),
                ${userId},
                ${JSON.stringify(images ?? [])},
                ${description},
                ST_GeographyFromText('POINT(${longitude} ${latitude})'),
                'new'
            )
            RETURNING *
        `;

        const record = resultSos[0];
        this.notificationGateway.server.emit('sos:new', record);

        const nearbyRescuers = await this.prisma.user.findMany({
            where: { role: 'rescuer' },
            select: { id: true },
        });
        await Promise.all(
            nearbyRescuers.map((r) =>
                this.notificationService.create(r.id, 'sos_new', {
                    sosId: record.id,
                    description: dto.description,
                }),
            ),
        );

        return record;
    }

    // Tìm kiếm SOS gần nhất
    async findNearby(lat: number, lng: number, radius: number) {
        const searchRadius = radius ?? 5000; // default 5km

        if (lat < -90 || lat > 90)
            throw new BadRequestException('Invalid latitude');

        if (lng < -180 || lng > 180)
            throw new BadRequestException('Invalid longitude');

        return this.prisma.$queryRaw<any>`
            SELECT * FROM "SosReport"
            WHERE status = 'new' AND ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
                ${searchRadius}
            )
            ORDER BY created_at DESC
        `;
    }

    // Method accept SOS
    async accept(sosId: string, rescuerId: string) {
        const result = await this.prisma.$executeRaw`
            UPDATE "SosReport"
            SET rescuer_id = ${rescuerId}, status = 'in_progress'
            WHERE id = ${sosId} AND status = 'new'
        `;

        if (result === 0) {
            throw new ConflictException('SOS not found or already accepted');
        }

        const sos = await this.prisma.sosReport.findUnique({ where: { id: sosId } });

        // Notify reporter
        if (sos?.reporter_id) {
            await this.notificationService.create(sos.reporter_id, 'sos_accepted', {
                sosId,
                rescuerId,
            });
        }

        return sos;
    }

    // Cập nhật trạng thái SOS
    async updateStatus(sosId: string, status: SosStatus) {
        const sos = await this.prisma.sosReport.findUnique({ where: { id: sosId } });
        if (!sos) {
            throw new BadRequestException('SOS not found');
        }
        if (sos.status === 'new' && status !== 'in_progress') {
            throw new BadRequestException('Invalid status transition');
        }
        if (sos.status === 'in_progress' && !['resolved','cancelled'].includes(status)) {
            throw new BadRequestException('Invalid status transition');
        }
        if (['resolved','cancelled'].includes(sos.status)) {
            throw new BadRequestException('SOS already closed');
        }

        await this.prisma.sosReport.update({
            where: { id: sosId },
            data: { status }
        });

        return this.prisma.sosReport.findUnique({ where: { id: sosId } });
    }

    async findById (id: string) {
        const sos = await this.prisma.sosReport.findUnique({ where: { id } });
        if (!sos) {
            throw new BadRequestException('SOS not found');
        }

        return sos;
    }
}