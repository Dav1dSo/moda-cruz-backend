import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { PermissionRepository } from '../../infrastructure/repositories/permission.repository';

@Injectable()
export class DeletePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    if (permission.is_critical) {
      throw new BadRequestException('Permissão crítica não pode ser removida');
    }

    const result = await this.permissionRepository.deleteIfUnused(id);

    if (result.notFound) {
      throw new NotFoundException('Permissão não encontrada');
    }

    if (!result.deleted) {
      throw new BadRequestException(
        `Não é possível remover: permissão vinculada a ${result.dependentsCount} perfil(is).`,
      );
    }

    return {
      message: 'Permissão removida com sucesso',
    };
  }
}
