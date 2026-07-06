import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterRequestDTO } from '../../dtos/request/auth-request';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { ResponseDefaultDTO } from '../../../../shared/shared.dtos';
import { NOTIFICATIONS_CLIENT } from '@contracts/auth/reset-password-requested.event';
import { USER_CREATED_EVENT } from '@contracts/users/user-created.event';
import type { UserCreatedEvent } from '@contracts/users/user-created.event';

@Injectable()
export class RegisterCustomerUseCase {
  constructor(
    private readonly userRepository: AuthRepository,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly brokerClient: ClientProxy,
  ) {}

  async execute(req: RegisterRequestDTO): Promise<ResponseDefaultDTO> {
    const user = await this.userRepository.findBasicByEmail(req.email);

    if (user) {
      throw new ConflictException('Email já cadastrado.');
    }

    await this.userRepository.createCustomerUser(req);

    const event: UserCreatedEvent = {
      name: req.name,
      email: req.email,
      phone: req.phone,
    };

    this.brokerClient.emit(USER_CREATED_EVENT, event);

    return { message: 'Conta criada com sucesso' };
  }
}
