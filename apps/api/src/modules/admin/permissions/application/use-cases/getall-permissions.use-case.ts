import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class GetAllPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute() {
    return await this.permissionRepository.findAll();
  }
}
