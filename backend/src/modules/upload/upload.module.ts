import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import {UploadService} from "./upload.service";

@Module({
    imports: [ConfigModule],
    providers: [UploadService], // Provide the UploadService to be used in this module
    exports: [UploadService]
})
export class UploadModule {}
