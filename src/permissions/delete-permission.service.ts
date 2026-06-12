import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infraestructure/services/database/prisma.service';
import { ResponseDefaultDTO } from 'src/shared/shared.dtos';

@Injectable()
export class DeletePermissionService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    await this.prismaService.permission.delete({
      where: { id },
    });

    return {
      message: 'Permissão removida com sucesso',
    };
  }
}