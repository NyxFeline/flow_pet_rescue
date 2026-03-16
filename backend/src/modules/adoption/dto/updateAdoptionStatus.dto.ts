import { IsEnum } from "class-validator";

export class UpdateAdoptionStatusDto {
    @IsEnum(["interview", "approved", "rejected"], {
        message: "Status must be interview, approved, or rejected"
    })
    status: 'interview' | 'approved' | 'rejected';
}