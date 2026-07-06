import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLoginRequestDTO } from '../../dtos/request/auth-request';
import { RequiredLoginResponseDTO } from '../../dtos/response/auth-response';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(req: AuthLoginRequestDTO): Promise<RequiredLoginResponseDTO> {
    const user = await this.userRepository.getUserByEmail(req.email);

    if (!user || user.deleted_at != null) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    const passwordMatch = await bcrypt.compare(
      req.password,
      user.password_hash,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas!');
    }

    if (!user.is_active) {
      throw new BadRequestException('Usuário inativo');
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

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        permissions,
        is_platform_admin: user.is_platform_admin,
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        expiresIn: '7d',
      },
    );

    await this.userRepository.updateLastLogin(user.id);

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
