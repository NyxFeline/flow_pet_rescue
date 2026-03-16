import { Module } from '@nestjs/common'
import { PrismaModule } from './prisma/prisma.module'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { validationSchema } from './config/validation'
import { UploadModule } from './modules/upload/upload.module'
import { SosModule } from './modules/sos/sos.module'
import { PetsModule } from './modules/pets/pets.module'
import { AdoptionModule } from './modules/adoption/adoption.module'

@Module({
    imports: [
        PrismaModule, 
        ConfigModule.forRoot({ isGlobal: true, validationSchema: validationSchema }), 
        SosModule,
        AuthModule, 
        UsersModule,
        UploadModule,
        PetsModule,
        AdoptionModule
    ],
})
export class AppModule {}