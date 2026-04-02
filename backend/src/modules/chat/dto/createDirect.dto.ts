import { IsUUID } from "class-validator";

export class CreateDirectDto {
    @IsUUID()
    targetUserId!: string;
}