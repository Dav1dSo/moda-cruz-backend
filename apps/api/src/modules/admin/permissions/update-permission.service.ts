import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreatePermissionRequestDTO } from './dto/request/permisions-request-dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';

@Injectable()
export class UpdatePermissionService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    id: number,
    req: CreatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    const permissionExists = await this.prismaService.permission.findFirst({
      where: {
        name: req.name,
        NOT: {
          id,
        },
      },
    });

    if (permissionExists) {
      throw new ConflictException('Permissão já cadastrada');
    }

    await this.prismaService.permission.update({
      where: { id },
      data: {
        name: req.name,
        slug: req.slug,
      },
    });

    return {
      message: 'Permissão atualizada com sucesso',
    };
  }
}
