import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { validationSchema } from './config/validation'
import { UploadModule } from './modules/upload/upload.module'

@Module({
    imports: [
        PrismaModule, 
        ConfigModule.forRoot({ isGlobal: true, validationSchema: validationSchema }), 
        AuthModule, 
        UsersModule,
        UploadModule
    ],
})
export class AppModule {}