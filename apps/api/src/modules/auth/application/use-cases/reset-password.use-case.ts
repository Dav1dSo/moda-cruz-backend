import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ResetPasswordRequestDTO } from '../../dtos/request/auth-service-dto';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthRepository } from '../../domain/repository';
import {
  NOTIFICATIONS_CLIENT,
  RESET_PASSWORD_REQUESTED_EVENT,
} from '@contracts/auth/reset-password-requested.event';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly brokerClient: ClientProxy,
  ) {}

  async execute(req: ResetPasswordRequestDTO) {
    try {
      const user = await this.userRepository.getUserByEmail(req.email);

      if (!user) {
        throw new NotFoundException('Email inválido!');
      }

      const tokenResetPassword = this.jwtService.sign(
        {
          sub: user.id,
          type: 'reset-password',
        },
        {
          secret: process.env.JWT_RESET_PASSWORD_SECRET || process.env.JWT_SECRET,
          expiresIn: '1d',
        },
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${tokenResetPassword}`;

      await lastValueFrom(
        this.brokerClient.emit(RESET_PASSWORD_REQUESTED_EVENT, {
          to: user.email,
          name: user.name,
          resetLink,
        }),
      );

      return {
        message: 'Acesse seu email para recuperar senha',
      };
    } catch (error) {
      throw error;
    }
  }
}
