import { UsersModule } from "../users/users.module";
import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [
    // 1. Import UsersModule để AuthService có thể gọi được UsersService
    UsersModule, 

    // 2. Import PassportModule (thư viện chuẩn cho Auth)
    PassportModule,

    // 3. Cấu hình JWT Module (Phần khó nhất - chú ý kỹ)
    JwtModule.registerAsync({
      imports: [ConfigModule], // Mượn ConfigModule vào đây
      inject: [ConfigService], // Tiêm ConfigService để dùng
      useFactory: async (configService: ConfigService) => ({
        // Lấy secret từ file .env (QUAN TRỌNG: tên biến phải khớp trong .env)
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
        
        // Cấu hình mặc định cho Access Token
        signOptions: { 
            expiresIn: '15m', // Hết hạn sau 15 phút
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Export ra để module khác dùng nếu cần
})
export class AuthModule {}