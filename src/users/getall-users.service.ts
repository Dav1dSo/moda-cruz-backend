import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import {
} from './dtos/request/user-request';
import { Injectable } from '@nestjs/common';
import { GetAllUsersFiltersDTO, GetAllUsersResponseDTO } from './dtos/response/user-response';

@Injectable()
export class UserServiceGetAll {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    filters: GetAllUsersFiltersDTO,
  ): Promise<GetAllUsersResponseDTO[]> {
    const query = await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      where: {
        name: filters.name
          ? { contains: filters.name, mode: 'insensitive' }
          : undefined,
        email: filters.email
          ? { contains: filters.email, mode: 'insensitive' }
          : undefined,
        createdAt:
          filters.createdAt || filters.createdAtEnd
            ? {
                gte: filters.createdAt
                  ? new Date(filters.createdAt)
                  : undefined,
                lte: filters.createdAtEnd
                  ? new Date(filters.createdAtEnd)
                  : undefined,
              }
            : undefined,
      },
      take: filters.per_page,
      skip: (filters.page - 1) * filters.per_page,
    });

    return query.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    }));
  }
}
