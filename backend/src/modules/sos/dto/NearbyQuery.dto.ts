import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator"

export class NearbyQueryDto {
    @Type(() => Number)
    @IsNumber()
    lat: number;

    @Type(() => Number)
    @IsNumber()
    lng: number;
    
    @IsNumber()
    @IsOptional()
    radius?: number;
}