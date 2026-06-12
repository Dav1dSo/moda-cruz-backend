import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import { ResponseDefaultDTO } from 'src/shared/shared.dtos';

@Injectable()
export class DeleteProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const profile = await this.prismaService.profile.findUnique({
      where: {
        id: id,
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.prismaService.profile.delete({
      where: {
        id: id,
      },
    });

    return {
      message: 'Perfil deletado com sucesso',
    };
  }
}
