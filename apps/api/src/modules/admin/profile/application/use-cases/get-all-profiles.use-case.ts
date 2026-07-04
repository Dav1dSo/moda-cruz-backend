import { Injectable } from '@nestjs/common';
import { GetAllProfilesRequestDTO } from '../../dto/request/profile-request-dto';
import { GetAllProfilesResponseDTO } from '../../dto/response/profile-respone-dto';
import { ProfileRepository } from '../../domain/repositories/profile.repository';

@Injectable()
export class GetAllProfilesUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(
    filters: GetAllProfilesRequestDTO,
  ): Promise<GetAllProfilesResponseDTO[]> {
    const profiles = await this.profileRepository.findAll(filters);

    return profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      is_active: profile.is_active,
      permission_ids: profile.permissions.map(
        (permission) => permission.permission_id,
      ),
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    }));
  }
}
