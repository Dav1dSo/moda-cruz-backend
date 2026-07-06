import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRequestDTO } from '../../dtos/request/auth-request';
import { RefreshTokenResponseDTO } from '../../dtos/response/auth-response';

interface RefreshTokenPayload {
  sub: number;
  email: string;
  permissions?: string[];
  is_platform_admin?: boolean;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(private readonly jwtService: JwtService) {}

  async execute(
    request: RefreshTokenRequestDTO,
  ): Promise<RefreshTokenResponseDTO> {
    if (!request.refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        request.refreshToken,
        {
          secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: payload.sub,
        email: payload.email,
        permissions: payload.permissions ?? [],
        is_platform_admin: payload.is_platform_admin ?? false,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      },
    );

    return {
      accessToken: accessToken,
    };
  }
}
