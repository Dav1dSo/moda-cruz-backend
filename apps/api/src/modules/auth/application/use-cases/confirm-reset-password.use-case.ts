import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResponseDefaultDTO } from '@shared/dtos';
import { ConfirmResetPasswordRequestDTO } from '../../dtos/request/auth-request';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProofMatches } from '../password-hash-proof';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ConfirmResetPasswordUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    req: ConfirmResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    let payload: { sub: number; type: string; pwd?: string };

    try {
      payload = this.jwtService.verify(req.token, {
        secret: this.configService.get<string>('JWT_RESET_PASSWORD_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(
        'Solicite um novo email e tente novamente.',
      );
    }

    if (payload.type !== 'reset-password') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.authRepository.findPasswordHashByIdAndEmail(
      payload.sub,
      req.email,
    );

    if (!user || user.deleted_at != null || !user.is_active) {
      throw new UnauthorizedException(
        'Solicite um novo email e tente novamente.',
      );
    }

    if (!passwordHashProofMatches(payload.pwd, user.password_hash)) {
      throw new UnauthorizedException(
        'Solicite um novo email e tente novamente.',
      );
    }

    const hashedPassword = await bcrypt.hash(req.new_password, 12);

    await this.authRepository.updatePassword(user.id, hashedPassword);

    return {
      message: 'Senha atualizada com sucesso',
    };
  }
}
