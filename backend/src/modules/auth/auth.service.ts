import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';

import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

interface JwtPayload {
    sub: string
    email: string
    role: string
}

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}

    // --- ĐĂNG KÝ ---
    async signUp(dto: RegisterDto): Promise<any> {
        // 1. Check email
        const exists = await this.usersService.findByEmail(dto.email);
        if (exists) {
            throw new BadRequestException('User already exists');
        }

        // 2. Hash password
        const passwordHash = await argon2.hash(dto.password);

        // 3. Create User
        // Lưu ý: UsersService phải có hàm create khớp với tham số này
        const newUser = await this.usersService.createUser({
            email: dto.email,
            password_hash: passwordHash,
            full_name: dto.full_name, // Uncomment nếu schema có trường này
        });

        // 4. Generate Tokens
        const tokens = await this.getTokens(newUser.id, newUser.email, newUser.role);

        // 5. Update Refresh Token Hash
        await this.updateRefreshTokenHash(newUser.id, tokens.refreshToken);

        return tokens;
    }

    // --- ĐĂNG NHẬP ---
    async signIn(dto: LoginDto): Promise<any> {
        // 1. Find User
        const user = await this.usersService.findByEmail(dto.email);
        if (!user) 
            throw new ForbiddenException('Access Denied');

        // 2. Compare Password
        const passwordMatches = await argon2.verify(user.password_hash, dto.password);
        if (!passwordMatches) 
            throw new ForbiddenException('Access Denied');

        // 3. Generate Tokens
        const tokens = await this.getTokens(user.id, user.email, user.role);

        // 4. Save Refresh Token
        await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

        return tokens;
    }

    // --- LOGOUT ---
    async logout(userId: string) {
        // Xóa refresh token hash khỏi database
        await this.usersService.updateUser(userId, { refresh_token_hash: null });
        // Trả về thông báo thành công
        return { message: 'Logged out successfully' };
    }

    // --- HELPER: TẠO TOKEN ---
    private async getTokens(userId: string, email: string, role: string) {
        const payload = {
            sub: userId,
            email: email,
            role: role,
        };

        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return {
            accessToken: at,
            refreshToken: rt,
        };
    }

    // --- HELPER: UPDATE HASH ---
    private async updateRefreshTokenHash(userId: string, refreshToken: string) {
        const hash = await argon2.hash(refreshToken);
        
        // Gọi hàm update bên UsersService
        await this.usersService.updateUser(userId, { refresh_token_hash: hash, });
    }

    async refreshTokens(refreshToken: string) {
        const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');

        if (!refreshSecret) {
            throw new Error('JWT_REFRESH_SECRET not configured');
        }

        try {
            const payload = await this.jwtService.verifyAsync<JwtPayload>(
                refreshToken,
                { secret: refreshSecret },
            );

            const user = await this.usersService.findById(payload.sub);

            if (!user || !user.refresh_token_hash) {
                throw new ForbiddenException('Access Denied');
            }

            const isMatch = await argon2.verify(
                user.refresh_token_hash,
                refreshToken,
            );

            if (!isMatch) {
                throw new ForbiddenException('Access Denied');
            }

            const tokens = await this.getTokens(
                user.id,
                user.email,
                user.role,
            );

            await this.updateRefreshTokenHash(
                user.id,
                tokens.refreshToken,
            );

            return tokens;

        } catch {
            throw new ForbiddenException('Access Denied');
        }
    }
}