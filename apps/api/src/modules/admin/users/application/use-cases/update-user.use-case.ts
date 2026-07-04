import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRequestDTO } from '../../dtos/request/user-request';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { UserRepository } from '../../domain/repositories/users.repository';

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
      throw new BadRequestException(
        'Email, CPF ou phone já estão cadastrados.',
      );
    }

    await this.userRepository.updateUser(user_id, req);

    if (req.profile_ids !== undefined) {
      await this.userRepository.syncUserProfiles(user_id, req.profile_ids);
    }

    return { message: 'Update successful.' };
  }
}
