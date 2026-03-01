import { Module, Global } from '@nestjs/common'
import { PrismaService } from './prisma.service'

// Dùng @Global() để làm cho PrismaModule trở thành một module toàn cục, 
// có thể được sử dụng ở bất kỳ đâu trong ứng dụng mà không cần phải import lại
@Global()
@Module({
    // Đăng ký PrismaService như một provider của module này, cho phép nó được inject vào các component khác
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}