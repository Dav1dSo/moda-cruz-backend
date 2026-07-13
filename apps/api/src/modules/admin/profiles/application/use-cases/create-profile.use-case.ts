import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaForeignKeyConstraintError } from '@shared/utils/prisma-errors';
import { CreateProfileRequestDTO } from '../../dtos/request/profile-request';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repository';

@Injectable()
export class CreateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(req: CreateProfileRequestDTO): Promise<ResponseDefaultDTO> {
    const profileExists = await this.profileRepository.findByName(req.name);

    if (profileExists) {
      throw new ConflictException('Já existe perfil com este nome.');
    }

    const uniquePermissionIds = [...new Set(req.permission_ids)];
    const existingPermissions =
      await this.profileRepository.findExistingPermissionIds(
        uniquePermissionIds,
      );

    if (existingPermissions.length < uniquePermissionIds.length) {
      throw new BadRequestException(
        'Uma ou mais permissões informadas não existem.',
      );
    }

    try {
      await this.profileRepository.create(req);
    } catch (error) {
      if (isPrismaForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'Uma ou mais permissões informadas não existem.',
        );
      }

      throw error;
    }

    return {
      message: 'Perfil criado com sucesso',
    };
  }
}
