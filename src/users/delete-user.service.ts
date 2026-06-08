import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infraestructure/services/database/prisma.service";
import { ResponseDefaultDTO } from "src/shared/shared.dtos";

@Injectable()
export class UserServiceDelete {
    constructor(private readonly prismaService: PrismaService) {}

    async execute(id: number): Promise<ResponseDefaultDTO> {
        await this.prismaService.user.delete({
            where: {
                id: id,
            },
        });
        return {
            message: 'User deleted successfully',
        };
    }
}