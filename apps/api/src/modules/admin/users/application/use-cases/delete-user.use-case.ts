import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { UserRepository } from '../../domain/repositories/users.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário inválido!');
    }

    await this.userRepository.deleteUser(id);

    return {
      message: 'User deleted successfully',
    };
  }
}
