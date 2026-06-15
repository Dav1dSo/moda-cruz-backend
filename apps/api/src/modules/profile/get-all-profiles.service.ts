import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { GetAllProfilesRequestDTO } from './dto/request/profile-request-dto';
import { GetAllProfilesResponseDTO } from './dto/response/profile-respone-dto';

@Injectable()
export class GetAllProfilesService {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

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
        ...(filters.active !== undefined && {
          active: filters.active === 'true',
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
      active: profile.active,
      permissionIds: profile.permissions.map(
        (permission) => permission.permissionId,
      ),
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }));
  }
}