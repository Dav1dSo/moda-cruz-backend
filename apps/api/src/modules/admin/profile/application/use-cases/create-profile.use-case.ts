import { ConflictException, Injectable } from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { CreateProfileRequestDTO } from '../../dto/request/profile-request-dto';
import { ProfileRepository } from '../../domain/repositories/profile.repository';

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
