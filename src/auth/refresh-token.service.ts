import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  RefreshTokenRequestDTO,
} from './dtos/request/auth-service-dto';
import { RefreshTokenResponseDTO } from './dtos/response/auth-response-dto';

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

      const payload = await this.jwtService.verifyAsync(request.refreshToken);

      const accessToken = await this.jwtService.signAsync({
        sub: payload.sub,
        email: payload.email,
      });

      return {
        accessToken: accessToken,
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
