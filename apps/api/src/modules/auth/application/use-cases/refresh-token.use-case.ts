import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRequestDTO } from '../../dtos/request/auth-service-dto';
import { RefreshTokenResponseDTO } from '../../dtos/response/auth-response-dto';

@Injectable()
export class AuthRefreshTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async execute(
    request: RefreshTokenRequestDTO,
  ): Promise<RefreshTokenResponseDTO> {
    try {
      if (!request.refreshToken) {
        throw new UnauthorizedException('Refresh token not found');
      }

      const payload = await this.jwtService.verifyAsync(request.refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      const accessToken = await this.jwtService.signAsync({
        sub: payload.sub,
        email: payload.email,
        permissions: payload.permissions ?? [],
        is_platform_admin: payload.is_platform_admin ?? false,
      }, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      });

      return {
        accessToken: accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
