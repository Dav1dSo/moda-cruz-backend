import { Injectable, ParseIntPipe } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { GetAllUsersResponseDTO } from './dtos/response/user-response';

@Injectable()
export class FindUserService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: number): Promise<GetAllUsersResponseDTO | null> {
    try {
      const query = await this.prismaService.user.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      return query
        ? {
            id: query.id,
            name: query.name,
            email: query.email,
            createdAt: query.createdAt.toISOString(),
          }
        : null;
    } catch (error) {
      throw error;
    }
  }
}
