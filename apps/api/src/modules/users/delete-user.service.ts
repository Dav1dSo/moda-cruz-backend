import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ResponseDefaultDTO } from '../../shared/shared.dtos';

@Injectable()
export class UserServiceDelete {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    try {
      const get_user = await this.prismaService.user.delete({
        where: {
          id: id,
        },
      });

      if (get_user === null) {
        throw new NotFoundException('Usuário inválido!');
      }

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}
