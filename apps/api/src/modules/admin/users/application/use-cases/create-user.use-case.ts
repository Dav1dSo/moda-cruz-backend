import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaUniqueConstraintError,
  uniqueConstraintCovers,
} from '@shared/utils/prisma-errors';
import { CreateUserRequestDTO } from '../../dtos/request/user-request';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { NOTIFICATIONS_CLIENT } from '@contracts/notifications';
import { USER_CREATED_EVENT } from '@contracts/users/user-created.event';
import type { UserCreatedEvent } from '@contracts/users/user-created.event';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly brokerClient: ClientProxy,
  ) {}

  async execute(req: CreateUserRequestDTO): Promise<ResponseDefaultDTO> {
    const user = await this.userRepository.getUserByEmail(req.email);

    if (user) {
      throw new ConflictException('Email já cadastrado.');
    }

    const phoneOwner = await this.userRepository.getUserByPhone(req.phone);

    if (phoneOwner) {
      throw new ConflictException('Telefone já cadastrado.');
    }

    const profileIds = Array.from(new Set(req.profile_ids));

    const existingProfileIds =
      await this.userRepository.findExistingProfileIds(profileIds);

    if (existingProfileIds.length !== profileIds.length) {
      throw new BadRequestException(
        'Um ou mais perfis informados não existem.',
      );
    }

    try {
      await this.userRepository.createUser(req, profileIds);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        if (uniqueConstraintCovers(error, 'email')) {
          throw new ConflictException('Email já cadastrado.');
        }

        if (uniqueConstraintCovers(error, 'phone')) {
          throw new ConflictException('Telefone já cadastrado.');
        }
      }

      if (isPrismaForeignKeyConstraintError(error)) {
        throw new BadRequestException(
          'Um ou mais perfis informados não existem.',
        );
      }

      throw error;
    }

    const event: UserCreatedEvent = {
      name: req.name,
      email: req.email,
      phone: req.phone,
    };

    this.brokerClient.emit(USER_CREATED_EVENT, event);

    return { message: 'Usuário criado com sucesso' };
  }
}
