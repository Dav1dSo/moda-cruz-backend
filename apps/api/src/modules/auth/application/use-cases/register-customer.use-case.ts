import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RegisterRequestDTO } from '../../dtos/request/auth-request';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaUniqueConstraintError } from '@shared/utils/prisma-errors';
import { NOTIFICATIONS_CLIENT } from '@contracts/notifications';
import { USER_CREATED_EVENT } from '@contracts/users/user-created.event';
import type { UserCreatedEvent } from '@contracts/users/user-created.event';

@Injectable()
export class RegisterCustomerUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly brokerClient: ClientProxy,
  ) {}

  async execute(req: RegisterRequestDTO): Promise<ResponseDefaultDTO> {
    const user = await this.authRepository.findBasicByEmail(req.email);

    if (user) {
      throw new ConflictException('Email já cadastrado.');
    }

    try {
      await this.authRepository.createCustomerUser(req);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException('Email já cadastrado.');
      }

      throw error;
    }

    const event: UserCreatedEvent = {
      name: req.name,
      email: req.email,
      phone: req.phone,
    };

    this.brokerClient.emit(USER_CREATED_EVENT, event);

    return { message: 'Conta criada com sucesso' };
  }
}
