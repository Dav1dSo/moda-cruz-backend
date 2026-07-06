import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../infrastructure/repositories/permission.repository';
import { GetPermissionResponseDTO } from '../../dtos/response/permission-response';

@Injectable()
export class GetAllPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(): Promise<GetPermissionResponseDTO[]> {
    const permissions = await this.permissionRepository.findAll();

    return permissions.map((permission) => ({
      id: permission.id,
      key: permission.key,
      name: permission.name,
      description: permission.description ?? null,
      module: permission.module,
      is_critical: permission.is_critical,
      created_at: permission.created_at.toISOString(),
      updated_at: permission.updated_at.toISOString(),
    }));
  }
}
