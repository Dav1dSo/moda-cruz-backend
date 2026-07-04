import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { CreateProfileRequestDTO, GetAllProfilesRequestDTO } from '../../dto/request/profile-request-dto';

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

  async create(req: CreateProfileRequestDTO) {
    return await this.db.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: { name: req.name, is_active: req.is_active },
      });

      await tx.profilePermission.createMany({
        data: req.permission_ids.map((permission_id) => ({
          profileId: profile.id,
          permission_id,
        })),
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
        filters.is_active !== undefined
          ? filters.is_active === 'true'
          : undefined,
    };

    return await this.db.profile.findMany({
      where,
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: number, data: { name?: string; is_active?: boolean }) {
    await this.db.profile.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.db.profile.delete({ where: { id } });
  }
}
