import { Injectable, ParseIntPipe } from "@nestjs/common";
import { PrismaService } from "src/infraestructure/services/database/prisma.service";
import { GetAllUsersResponseDTO } from "./dtos/users.dto";


@Injectable()
export class FindUserService {
    constructor(private readonly prismaService: PrismaService) {}

    async execute(id: number): Promise<GetAllUsersResponseDTO | null> {
        const query = await this.prismaService.user.findUnique({
            where: {
                id: id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            }
        }); 
        return query ? {
            id: query.id,
            name: query.name,
            email: query.email,
            createdAt: query.createdAt.toISOString(),
        } : null;
    }

}