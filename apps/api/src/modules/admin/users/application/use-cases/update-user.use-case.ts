import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserRequestDTO } from '../../dtos/request/user-request';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaUniqueConstraintError,
  uniqueConstraintTargets,
} from '@shared/utils/prisma-errors';
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
      req.email,
      req.phone,
    );

    if (userExists) {
      throw new ConflictException('Email ou telefone já cadastrados.');
    }

    const profileIds =
      req.profile_ids !== undefined
        ? Array.from(new Set(req.profile_ids))
        : undefined;

    if (profileIds !== undefined) {
      const existingProfileIds =
        await this.userRepository.findExistingProfileIds(profileIds);

      if (existingProfileIds.length !== profileIds.length) {
        throw new BadRequestException(
          'Um ou mais perfis informados não existem.',
        );
      }
    }

    try {
      await this.userRepository.updateUserWithProfiles(
        user_id,
        req,
        profileIds,
      );
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        const targets = uniqueConstraintTargets(error);

        if (targets.includes('email') || targets.includes('phone')) {
          throw new ConflictException('Email ou telefone já cadastrados.');
        }
      }

      if (isPrismaForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'Um ou mais perfis informados não existem.',
        );
      }

      throw error;
    }

    return { message: 'Usuário atualizado com sucesso' };
  }
}
