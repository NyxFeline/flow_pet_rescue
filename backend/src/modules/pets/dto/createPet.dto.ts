import { IsArray, IsBoolean, IsInt, IsOptional, IsString} from "class-validator";

export class CreatePetDto {

    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    species?: string;

    @IsInt()
    @IsOptional()
    age?: number;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsBoolean()
    @IsOptional()
    is_vaccinated?: boolean;

    @IsString()
    @IsOptional()
    description?: string;

    @IsArray()
    @IsOptional()
    images?: string[];
}