import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { UpdateProfileRequestDTO } from '../../dtos/request/profile-request';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repository';
import { PermissionRepository } from '../../../permissions/infrastructure/repositories/permission.repository';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(
    id: number,
    req: UpdateProfileRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    if (req.name) {
      const nameExists = await this.profileRepository.findByNameExcludingId(
        id,
        req.name,
      );

      if (nameExists) {
        throw new ConflictException('Já existe um perfil com este nome');
      }
    }

    let uniquePermissionIds: number[] | undefined;

    if (req.permission_ids !== undefined) {
      uniquePermissionIds = [...new Set(req.permission_ids)];
      const foundPermissionsCount =
        await this.permissionRepository.countByIds(uniquePermissionIds);

      if (foundPermissionsCount < uniquePermissionIds.length) {
        throw new BadRequestException('IDs de permissão inválidos.');
      }
    }

    await this.profileRepository.update(id, {
      ...(req.name && { name: req.name }),
      ...(req.is_active !== undefined && { is_active: req.is_active }),
      ...(uniquePermissionIds !== undefined && {
        permission_ids: uniquePermissionIds,
      }),
    });

    return { message: 'Perfil atualizado com sucesso' };
  }
}
