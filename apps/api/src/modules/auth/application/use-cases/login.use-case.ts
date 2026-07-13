import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthLoginRequestDTO } from '../../dtos/request/auth-request';
import { LoginWithRefreshTokenResponseDTO } from '../../dtos/response/auth-response';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { passwordHashProof } from '../password-hash-proof';

const TIMING_EQUALIZATION_DUMMY_PASSWORD_HASH =
  '$2b$12$XdQhqfqJ8VzTM7QuUHmXZ.YzePyHGc/FyC.2rBf4Ni8UTnsYgRs0q';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    req: AuthLoginRequestDTO,
  ): Promise<LoginWithRefreshTokenResponseDTO> {
    const user = await this.authRepository.getUserByEmail(req.email);

    if (!user || user.deleted_at != null || !user.is_active) {
      await bcrypt.compare(
        req.password,
        TIMING_EQUALIZATION_DUMMY_PASSWORD_HASH,
      );

      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const passwordMatch = await bcrypt.compare(
      req.password,
      user.password_hash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas!');
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

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        type: 'refresh',
        pwd: passwordHashProof(user.password_hash),
      },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      },
    );

    await this.authRepository.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_platform_admin: user.is_platform_admin,
      },
      profiles: user.profiles.map((profileRelation) => ({
        id: profileRelation.profile.id,
        name: profileRelation.profile.name,
        permissions: profileRelation.profile.permissions.map(
          (profilePermission) => profilePermission.permission.key,
        ),
      })),
    };
  }
}
