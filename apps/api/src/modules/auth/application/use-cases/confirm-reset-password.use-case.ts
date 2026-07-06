import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResponseDefaultDTO } from '../../../../shared/shared.dtos';
import { ConfirmResetPasswordRequestDTO } from '../../dtos/request/auth-request';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ConfirmResetPasswordUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: AuthRepository,
  ) {}

  async execute(
    req: ConfirmResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    let payload: { sub: number; type: string };

    try {
      payload = this.jwtService.verify(req.token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });
    } catch {
      throw new UnauthorizedException(
        'Solicite um novo email e tente novamente.',
      );
    }

    if (payload.type !== 'reset-password') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.userRepository.findByIdAndEmail(
      payload.sub,
      req.email,
    );

    if (!user) {
      throw new BadRequestException('Não foi possível executar ação.');
    }

    const hashedPassword = await bcrypt.hash(req.new_password, 12);

    await this.userRepository.updatePassword(user.id, hashedPassword);

    return {
      message: 'Senha atualizada com sucesso',
    };
  }
}
