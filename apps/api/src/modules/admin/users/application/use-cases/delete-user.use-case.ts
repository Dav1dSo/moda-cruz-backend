import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { UserRepository } from '../../infrastructure/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    await this.userRepository.deleteUser(id);

    return {
      message: 'Usuário removido com sucesso',
    };
  }
}
