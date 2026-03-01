import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtGuard } from './guards/jwt.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: RegisterDto) {
        return this.authService.signUp(dto);
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK) // Mặc định Post là 201, login nên là 200
    signin(@Body() dto: LoginDto) {
        return this.authService.signIn(dto);
    }
    
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh(@Body() dto: RefreshDto){
        return this.authService.refreshTokens(dto.refresh_token);
    }

    @UseGuards(JwtGuard)
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    logout(@GetUser('userId') userId: string) {
        return this.authService.logout(userId);
    }
}