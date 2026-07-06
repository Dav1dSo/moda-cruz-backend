import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { ProfileRepository } from '../../infrastructure/repositories/profile.repository';

@Injectable()
export class DeleteProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Perfil não encontrado');
    }

    const result = await this.profileRepository.deleteIfUnused(id);

    if (result.notFound) {
      throw new NotFoundException('Perfil não encontrado');
    }

    if (!result.deleted) {
      throw new BadRequestException(
        `Não é possível remover: perfil vinculado a ${result.dependentsCount} usuário(s).`,
      );
    }

    return {
      message: 'Perfil deletado com sucesso',
    };
  }
}
