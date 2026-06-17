import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@app/database';
import { ResponseDefaultDTO } from '../../../../shared/shared.dtos';
import { ConfirmResetPasswordRequestDTO } from '../../dtos/request/auth-service-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ConfirmResetPasswordUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(
    req: ConfirmResetPasswordRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    try {
      const payload = this.jwtService.verify(req.token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });

      if (payload.type !== 'reset-password') {
        throw new UnauthorizedException('Token inválido');
      }

      const user = this.prismaService.user.findFirst({
        where: {
          email: req.email,
        },
      });

      if (!user) {
        throw new BadRequestException('Não foi possível executar ação.');
      }

      const hashedPassword = await bcrypt.hash(req.new_password, 10);

      await this.prismaService.user.update({
        where: { id: payload.sub },
        data: { password_hash: hashedPassword },
      });

      return {
        message: 'Senha atualizada com sucesso',
      };
    } catch (error) {
      throw new UnauthorizedException(
        'Solicite um novo email e tente novamente.',
      );
    }
  }
}
