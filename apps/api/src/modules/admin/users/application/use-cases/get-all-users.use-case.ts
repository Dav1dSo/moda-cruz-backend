import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { GetAllUsersFiltersDTO } from '../../dtos/request/user-request';
import { GetAllUsersResponseDTO } from '../../dtos/response/user-response';

@Injectable()
export class GetAllUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    filters: GetAllUsersFiltersDTO,
  ): Promise<GetAllUsersResponseDTO[]> {
    const users = await this.userRepository.findAll(filters);

    return users.map((user) => ({
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
    }));
  }
}
