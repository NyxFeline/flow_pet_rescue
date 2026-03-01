import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { validationSchema } from './config/validation'

@Module({
    imports: [
        PrismaModule, 
        ConfigModule.forRoot({ isGlobal: true, validationSchema: validationSchema }), 
        AuthModule, 
        UsersModule
    ],
})
export class AppModule {}