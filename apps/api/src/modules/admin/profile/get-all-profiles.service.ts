import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { GetAllProfilesRequestDTO } from './dto/request/profile-request-dto';
import { GetAllProfilesResponseDTO } from './dto/response/profile-respone-dto';

@Injectable()
export class GetAllProfilesService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    filters: GetAllProfilesRequestDTO,
  ): Promise<GetAllProfilesResponseDTO[]> {
    const profiles = await this.prismaService.profile.findMany({
      where: {
        ...(filters.name && {
          name: {
            contains: filters.name,
            mode: 'insensitive',
          },
        }),
        ...(filters.is_active !== undefined && {
          is_active: filters.is_active === 'true',
        }),
      },
      include: {
        permissions: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

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
