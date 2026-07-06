import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRequestDTO } from '../../dtos/request/user-request';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    req: UpdateUserRequestDTO,
    user_id: number,
  ): Promise<ResponseDefaultDTO> {
    const user = await this.userRepository.findById(user_id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const userExists = await this.userRepository.findByEmailOrPhoneExcludingId(
      user_id,
      req,
    );

    if (userExists) {
      throw new ConflictException('Email ou telefone já cadastrados.');
    }

    await this.userRepository.updateUserWithProfiles(user_id, req);

    return { message: 'Usuário atualizado com sucesso' };
  }
}
