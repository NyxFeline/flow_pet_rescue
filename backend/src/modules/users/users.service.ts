import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

// UsersService là một service trong module Users, chịu trách nhiệm xử lý các logic liên quan đến người dùng
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        })
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        })
    }

    async createUser(data: {
        email: string
        password_hash: string
        full_name?: string
    }) {
        return this.prisma.user.create({
            data,
        })
    }

    async updateUser(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

}