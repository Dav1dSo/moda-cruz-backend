import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  CreateProfileRequestDTO,
  GetAllProfilesRequestDTO,
  UpdateProfileRequestDTO,
} from '../../dtos/request/profile-request';
import { isPrismaNotFoundError } from '@shared/utils/prisma-errors';

@Injectable()
export class ProfileRepository {
  constructor(private readonly db: PrismaService) {}

  async findByName(name: string) {
    return await this.db.profile.findFirst({ where: { name } });
  }

  async findByNameExcludingId(id: number, name: string) {
    return await this.db.profile.findFirst({
      where: { name, NOT: { id } },
    });
  }

  async findById(id: number) {
    return await this.db.profile.findUnique({ where: { id } });
  }

  async findExistingPermissionIds(ids: number[]) {
    return await this.db.permission.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
  }

  async create(req: CreateProfileRequestDTO) {
    return await this.db.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: { name: req.name, is_active: req.is_active },
      });

      await tx.profilePermission.createMany({
        data: req.permission_ids.map((permission_id) => ({
          profile_id: profile.id,
          permission_id,
        })),
        skipDuplicates: true,
      });

      return profile;
    });
  }

  async findAll(filters: GetAllProfilesRequestDTO) {
    const where = {
      name: filters.name
        ? { contains: filters.name, mode: 'insensitive' as const }
        : undefined,
      is_active:
        filters.is_active !== undefined ? filters.is_active : undefined,
    };

    return await this.db.profile.findMany({
      where,
      take: filters.per_page,
      skip: (filters.page - 1) * filters.per_page,
      select: {
        id: true,
        name: true,
        is_active: true,
        created_at: true,
        updated_at: true,
        permissions: {
          select: { permission_id: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(
    id: number,
    data: Pick<
      UpdateProfileRequestDTO,
      'name' | 'is_active' | 'permission_ids'
    >,
  ) {
    await this.db.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id },
        data: {
          name: data.name,
          is_active: data.is_active,
        },
      });

      if (data.permission_ids !== undefined) {
        await tx.profilePermission.deleteMany({ where: { profile_id: id } });
        await tx.profilePermission.createMany({
          data: data.permission_ids.map((permission_id) => ({
            profile_id: id,
            permission_id,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async deleteIfUnused(id: number): Promise<{
    deleted: boolean;
    dependentsCount: number;
    notFound?: boolean;
  }> {
    return await this.db.$transaction(async (tx) => {
      const dependentsCount = await tx.userProfile.count({
        where: { profile_id: id },
      });

      if (dependentsCount > 0) {
        return { deleted: false, dependentsCount };
      }

      try {
        await tx.profile.delete({ where: { id } });
      } catch (error) {
        if (isPrismaNotFoundError(error)) {
          return { deleted: false, dependentsCount: 0, notFound: true };
        }

        throw error;
      }

      return { deleted: true, dependentsCount: 0 };
    });
  }
}
