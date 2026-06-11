import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserRequestDTO } from './dtos/request/user-request';
import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import { ResponseDefaultDTO } from 'src/shared/shared.dtos';

@Injectable()
export class UserServiceUpdate {
  constructor(private readonly prismaService: PrismaService) {}
  async execute(
    req: UpdateUserRequestDTO,
    user_id: number,
  ): Promise<ResponseDefaultDTO> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          id: user_id,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      await this.prismaService.user.update({
        where: { id: user_id },
        data: {
          name: req.name,
          email: req.email,
          telefone: req.telefone,

          address: {
            create: {
              street: req.street,
              city: req.city,
              state: req.state,
              zipCode: req.zipCode,
              country: req.country,
              number: req.number,
            },
          },
        },
      });

      return { message: "Update successful."};
    } catch (error) {
      throw error;
    }
  }
}
