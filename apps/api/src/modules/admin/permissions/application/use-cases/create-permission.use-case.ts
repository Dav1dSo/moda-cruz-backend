import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionRequestDTO } from '../../dto/request/permisions-request-dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

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

    await this.permissionRepository.create(req);

    return { message: 'Permissão cadastrada com sucesso' };
  }
}
