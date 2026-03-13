import { SosStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateSosStatusDto {
    @IsEnum(SosStatus)
    status: SosStatus;
}