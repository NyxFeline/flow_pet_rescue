import { IsArray, IsNotEmpty, IsNumber, IsString, ArrayMinSize } from "class-validator";

export class CreateSosDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    images: string[];

    @IsNumber()
    @IsNotEmpty()
    latitude: number;

    @IsNumber()
    @IsNotEmpty()
    longitude: number;

    @IsString()
    @IsNotEmpty()
    description: string;
}