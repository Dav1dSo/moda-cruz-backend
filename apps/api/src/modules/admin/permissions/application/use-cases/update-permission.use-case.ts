import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdatePermissionRequestDTO } from '../../dtos/request/permission-request';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { PermissionRepository } from '../../infrastructure/repositories/permission.repository';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(
    id: number,
    req: UpdatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    if (permission.is_critical) {
      throw new BadRequestException('Permissão crítica não pode ser alterada');
    }

    const permissionExists =
      await this.permissionRepository.findByNameExcludingId(id, req.name);

    if (permissionExists) {
      throw new ConflictException('Permissão já cadastrada');
    }

    const keyExists = await this.permissionRepository.findByKeyExcludingId(
      id,
      req.key,
    );

    if (keyExists) {
      throw new ConflictException('Chave de permissão já cadastrada');
    }

    await this.permissionRepository.update(id, req);

    return {
      message: 'Permissão atualizada com sucesso',
    };
  }
}
