import { ConflictException, Injectable } from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
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

    await this.profileRepository.create(req);

    return {
      message: 'Perfil criado com sucesso',
    };
  }
}
