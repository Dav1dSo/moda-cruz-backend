import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetUserResponseDTO } from '../../dtos/response/user-response';

@Injectable()
export class FindUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: number): Promise<GetUserResponseDTO> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      is_active: user.is_active,
      is_platform_admin: user.is_platform_admin,
      last_login_at: user.last_login_at?.toISOString() ?? null,
      created_at: user.created_at.toISOString(),
      profiles: user.profiles.map((userProfile) => ({
        id: userProfile.profile.id,
        name: userProfile.profile.name,
      })),
    };
  }
}
