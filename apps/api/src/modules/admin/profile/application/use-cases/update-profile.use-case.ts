import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
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

    await this.profileRepository.update(id, {
      ...(req.name && { name: req.name }),
      ...(req.is_active !== undefined && { is_active: req.is_active }),
    });

    return { message: 'Perfil atualizado com sucesso' };
  }
}
