import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenResponseDTO } from '../../dtos/response/auth-response';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProofMatches } from '../password-hash-proof';

interface RefreshTokenPayload {
  sub: number;
  type?: string;
  pwd?: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    refreshToken: string | undefined,
  ): Promise<RefreshTokenResponseDTO> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (!payload.sub || payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.authRepository.findForRefreshById(payload.sub);

    if (!user || user.deleted_at != null || !user.is_active) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (!passwordHashProofMatches(payload.pwd, user.password_hash)) {
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
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      },
    );

    return {
      accessToken: accessToken,
    };
  }
}
