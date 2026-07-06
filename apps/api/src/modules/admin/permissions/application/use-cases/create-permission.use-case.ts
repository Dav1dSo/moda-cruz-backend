import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionRequestDTO } from '../../dtos/request/permission-request';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { PermissionRepository } from '../../infrastructure/repositories/permission.repository';

@Injectable()
export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(req: CreatePermissionRequestDTO): Promise<ResponseDefaultDTO> {
    const existingPermission = await this.permissionRepository.findByName(
      req.name,
    );

    if (existingPermission) {
      throw new ConflictException('Permissão já cadastrada');
    }

    const existingKey = await this.permissionRepository.findByKey(req.key);

    if (existingKey) {
      throw new ConflictException('Chave de permissão já cadastrada');
    }

    await this.permissionRepository.create(req);

    return { message: 'Permissão cadastrada com sucesso' };
  }
}
