import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

// Dùng @Injectable() để đánh dấu PrismaService là một provider có thể được inject vào các component khác trong NestJS
// PrismaService extends PrismaClient để kế thừa tất cả các phương thức của PrismaClient, 
// đồng thời implement OnModuleInit để thực hiện kết nối đến database khi module được khởi tạo
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    // Khi module được khởi tạo, tự động kết nối đến database bằng cách gọi phương thức $connect() của PrismaClient
    async onModuleInit() {
        await this.$connect()
    }

    // Khi ứng dụng NestJS được tắt, PrismaService sẽ tự động đóng kết nối đến database để tránh rò rỉ kết nối
    async enableShutdownHooks(app: INestApplication) {
        this.$on('beforeExit', async () => {
            await app.close()
        })
    }
}