import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthLoginRequestDTO } from './dtos/request/auth-service-dto';
import { AuthLoginResponseDTO } from './dtos/response/auth-response-dto';
import { PrismaService } from '@app/database';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthLoginService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(req: AuthLoginRequestDTO): Promise<AuthLoginResponseDTO> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: { email: req.email },
      });

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas!');
      }

      const passwordMatch = await bcrypt.compare(req.password, user.password);

      if (!passwordMatch) {
        throw new UnauthorizedException('Credenciais inválidas!');
      }

      const payload = {
        id: user.id,
        email: user.email,
      };

      const accessToken = this.jwtService.sign(payload as any, {
        expiresIn: '15m',
      });

      const refreshToken = this.jwtService.sign(payload as any, {
        expiresIn: '7d',
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
