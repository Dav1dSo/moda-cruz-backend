import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRequestDTO } from './dtos/request/user-request';
import { PrismaService } from '@app/database';
import { ResponseDefaultDTO } from '../../../shared/shared.dtos';

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

      const userExists = await this.prismaService.user.findFirst({
        where: {
          NOT: {
            id: user_id,
          },
          OR: [{ email: req.email }, { phone: req.phone }],
        },
      });

      if (userExists) {
        throw new BadRequestException(
          'Email, CPF ou phone já estão cadastrados.',
        );
      }

      await this.prismaService.user.update({
        where: { id: user_id },
        data: {
          name: req.name,
          email: req.email,
          phone: req.phone,

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

      return { message: 'Update successful.' };
    } catch (error) {
      throw error;
    }
  }
}
