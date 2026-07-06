import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { CreateUserRequestDTO } from '../../dtos/request/user-request';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { NOTIFICATIONS_CLIENT } from '@contracts/auth/reset-password-requested.event';
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

    await this.userRepository.createUser(req);

    const event: UserCreatedEvent = {
      name: req.name,
      email: req.email,
      phone: req.phone,
    };

    this.brokerClient.emit(USER_CREATED_EVENT, event);

    return { message: 'Usuário criado com sucesso' };
  }
}
