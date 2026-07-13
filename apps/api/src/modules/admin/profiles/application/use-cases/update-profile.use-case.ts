import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaForeignKeyConstraintError } from '@shared/utils/prisma-errors';
import { UpdateProfileRequestDTO } from '../../dtos/request/profile-request';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repository';

@Injectable()
export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

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
      const existingPermissions =
        await this.profileRepository.findExistingPermissionIds(
          uniquePermissionIds,
        );

      if (existingPermissions.length < uniquePermissionIds.length) {
        throw new BadRequestException(
          'Uma ou mais permissões informadas não existem.',
        );
      }
    }

    try {
      await this.profileRepository.update(id, {
        ...(req.name && { name: req.name }),
        ...(req.is_active !== undefined && { is_active: req.is_active }),
        ...(uniquePermissionIds !== undefined && {
          permission_ids: uniquePermissionIds,
        }),
      });
    } catch (error) {
      if (isPrismaForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'Uma ou mais permissões informadas não existem.',
        );
      }

      throw error;
    }

    return { message: 'Perfil atualizado com sucesso' };
  }
}
