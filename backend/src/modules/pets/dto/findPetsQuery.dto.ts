import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsString } from "class-validator";

export class FindPetsQueryDto {
    @IsOptional()
    @IsString()
    species?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    minAge?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    maxAge?: number;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    is_vaccinated?: boolean;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    limit?: number = 10;
}