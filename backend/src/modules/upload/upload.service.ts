import { Injectable } from "@nestjs/common";
import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class UploadService {
    private s3: S3Client;
    private bucket: string;
    private publicUrl: string;

    constructor(private configService: ConfigService) {
        // 1. Lấy cấu hình từ environment variables
        const endpoint = this.configService.get<string>("S3_ENDPOINT");
        const accessKey = this.configService.get<string>("S3_ACCESS_KEY");
        const secretKey = this.configService.get<string>("S3_SECRET_KEY");
        const region = this.configService.get<string>("S3_REGION");
        const bucket = this.configService.get<string>("S3_BUCKET");
        const publicUrl = this.configService.get<string>("S3_PUBLIC_URL");

        //2. Validate configuration
        if (!endpoint || !accessKey || !secretKey || !bucket || !publicUrl || !region) {
            throw new Error("Missing S3 configuration in environment variables");
        }

        // 3. Gán bucket và publicUrl cho class
        this.bucket = bucket;
        this.publicUrl = publicUrl;

        // 4. Khởi tạo S3 client
        this.s3 = new S3Client({
            region: region,
            endpoint: endpoint,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle: true, // Quan trọng khi sử dụng với R2 hoặc MinIO
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException("No file provided");
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 5MB limit");
        }

        if (!file.mimetype.startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }

        // Generrate key
        const key = `uploads/${uuidv4()}`;

        // Upload file to S3 Cloudflare R2
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await this.s3.send(command);

        // Return public URL
        return `${this.publicUrl}/${key}`;
    }
}