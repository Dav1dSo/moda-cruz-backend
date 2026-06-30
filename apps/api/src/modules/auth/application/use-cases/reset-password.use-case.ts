import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { ResetPasswordRequestDTO } from '../../dtos/request/auth-service-dto';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  NOTIFICATIONS_CLIENT,
  RESET_PASSWORD_REQUESTED_EVENT,
} from '@contracts/auth/reset-password-requested.event';

@Injectable()
export class ResetPasswordService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly notificationsClient: ClientProxy,
  ) {}

  async execute(req: ResetPasswordRequestDTO) {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: req.email,
        },
      });

      if (!user) {
        throw new NotFoundException('Email inválido!');
      }

      const tokenResetPassword = this.jwtService.sign(
        {
          sub: user.id,
          type: 'reset-password',
        },
        {
          expiresIn: '1DAY',
        },
      );

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${tokenResetPassword}`;

      await lastValueFrom(
        this.notificationsClient.emit(RESET_PASSWORD_REQUESTED_EVENT, {
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
