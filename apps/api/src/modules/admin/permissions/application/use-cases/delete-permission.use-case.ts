import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class DeletePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    await this.permissionRepository.delete(id);

    return {
      message: 'Permissão removida com sucesso',
    };
  }
}
