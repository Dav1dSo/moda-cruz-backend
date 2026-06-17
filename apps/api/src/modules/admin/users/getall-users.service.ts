import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  GetAllUsersFiltersDTO,
  GetAllUsersResponseDTO,
} from './dtos/response/user-response';

@Injectable()
export class UserServiceGetAll {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    filters: GetAllUsersFiltersDTO,
  ): Promise<GetAllUsersResponseDTO[]> {
    try {
      const query = await this.prismaService.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          created_at: true,
        },
        where: {
          name: filters.name
            ? { contains: filters.name, mode: 'insensitive' }
            : undefined,
          email: filters.email
            ? { contains: filters.email, mode: 'insensitive' }
            : undefined,
          created_at:
            filters.created_at || filters.createdAtEnd
              ? {
                  gte: filters.created_at
                    ? new Date(filters.created_at)
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
        created_at: user.created_at.toISOString(),
      }));
    } catch (error) {
      throw error;
    }
  }
}
