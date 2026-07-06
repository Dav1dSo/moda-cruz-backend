import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRequestDTO } from '../../dtos/request/auth-request';
import { RefreshTokenResponseDTO } from '../../dtos/response/auth-response';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';

interface RefreshTokenPayload {
  sub: number;
  type?: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: AuthRepository,
  ) {}

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

    if (!payload.sub) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepository.findUserWithPermissionsById(
      payload.sub,
    );

    if (!user || user.deleted_at != null || !user.is_active) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const permissions = Array.from(
      new Set(
        user.profiles.flatMap((profileRelation) =>
          profileRelation.profile.permissions.map(
            (profilePermission) => profilePermission.permission.key,
          ),
        ),
      ),
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        permissions,
        is_platform_admin: user.is_platform_admin,
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
