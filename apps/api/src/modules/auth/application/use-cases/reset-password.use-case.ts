import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordRequestDTO } from '../../dtos/request/auth-request';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { ResponseDefaultDTO } from '@shared/dtos';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProof } from '../password-hash-proof';
import { NOTIFICATIONS_CLIENT } from '@contracts/notifications';
import { RESET_PASSWORD_REQUESTED_EVENT } from '@contracts/auth/reset-password-requested.event';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    @Inject(NOTIFICATIONS_CLIENT)
    private readonly brokerClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async execute(req: ResetPasswordRequestDTO): Promise<ResponseDefaultDTO> {
    const user = await this.authRepository.findForPasswordResetByEmail(
      req.email,
    );

    if (!user || user.deleted_at != null || !user.is_active) {
      return {
        message: 'Acesse seu email para recuperar senha',
      };
    }

    const tokenResetPassword = this.jwtService.sign(
      {
        sub: user.id,
        type: 'reset-password',
        pwd: passwordHashProof(user.password_hash),
      },
      {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
        expiresIn: '30m',
      },
    );

    const resetLink = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${tokenResetPassword}`;

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
