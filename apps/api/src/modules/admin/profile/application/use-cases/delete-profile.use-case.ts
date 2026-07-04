import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { ProfileRepository } from '../../domain/repositories/profile.repository';

@Injectable()
export class DeleteProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.profileRepository.delete(id);

    return {
      message: 'Perfil deletado com sucesso',
    };
  }
}
