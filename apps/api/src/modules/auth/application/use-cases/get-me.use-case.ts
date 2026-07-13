import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { MeResponseDTO } from '../../dtos/response/auth-response';

@Injectable()
export class GetMeUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string): Promise<MeResponseDTO> {
    if (!email) {
      throw new UnauthorizedException('Usuário inválido');
    }

    const user =
      await this.authRepository.findUserWithPermissionsByEmail(email);

    if (!user || user.deleted_at != null || !user.is_active) {
      throw new UnauthorizedException('Usuário inválido');
    }

    return {
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
