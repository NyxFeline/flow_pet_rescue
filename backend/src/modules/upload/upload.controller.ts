import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../auth/guards/jwt.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
    constructor(private readonly uploadService: UploadService) {
        FileInterceptor("file", {
            limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
        });
    }

    @Post()
    @UseGuards(JwtGuard) // Protect this route with JWT authentication
    @UseInterceptors(FileInterceptor("file")) // Use FileInterceptor to handle file uploads
    
    async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
        const url = await this.uploadService.uploadFile(file); // Upload the file and get the URL
        return { url };
    }
}