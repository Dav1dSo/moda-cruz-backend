import { Inject, Injectable } from '@nestjs/common';
import { ResetPasswordRequestDTO } from '../../dtos/request/auth-request';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseDefaultDTO } from '../../../../shared/shared.dtos';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import {
  NOTIFICATIONS_CLIENT,
  RESET_PASSWORD_REQUESTED_EVENT,
} from '@contracts/auth/reset-password-requested.event';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly brokerClient: ClientProxy,
  ) {}

  async execute(req: ResetPasswordRequestDTO): Promise<ResponseDefaultDTO> {
    const user = await this.userRepository.findBasicByEmail(req.email);

    if (!user) {
      return {
        message: 'Acesse seu email para recuperar senha',
      };
    }

    const tokenResetPassword = this.jwtService.sign(
      {
        sub: user.id,
        type: 'reset-password',
      },
      {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        expiresIn: '1d',
      },
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${tokenResetPassword}`;

    this.brokerClient.emit(RESET_PASSWORD_REQUESTED_EVENT, {
      to: user.email,
      name: user.name,
      resetLink,
    });

    return {
      message: 'Acesse seu email para recuperar senha',
    };
  }
}
