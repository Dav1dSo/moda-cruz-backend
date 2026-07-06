import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  CreateUserRequestDTO,
  GetAllUsersFiltersDTO,
  UpdateUserRequestDTO,
} from '../../dtos/request/user-request';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
  constructor(private readonly db: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email },
      select: { id: true },
    });
  }

  async findByEmailOrPhoneExcludingId(id: number, req: UpdateUserRequestDTO) {
    return await this.db.user.findFirst({
      where: {
        NOT: { id },
        OR: [{ email: req.email }, { phone: req.phone }],
      },
      select: { id: true },
    });
  }

  async findAll(filters: GetAllUsersFiltersDTO) {
    const where = {
      name: filters.name
        ? { contains: filters.name, mode: 'insensitive' as const }
        : undefined,
      email: filters.email
        ? { contains: filters.email, mode: 'insensitive' as const }
        : undefined,
      created_at:
        filters.created_at_start || filters.created_at_end
          ? {
              gte: filters.created_at_start
                ? new Date(filters.created_at_start)
                : undefined,
              lte: filters.created_at_end
                ? new Date(filters.created_at_end)
                : undefined,
            }
          : undefined,
    };

    return await this.db.user.findMany({
      where,
      take: filters.per_page,
      skip: (filters.page - 1) * filters.per_page,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        is_active: true,
        is_platform_admin: true,
        last_login_at: true,
        created_at: true,
        profiles: {
          select: {
            profile: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async findById(id: number) {
    return await this.db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        is_active: true,
        is_platform_admin: true,
        last_login_at: true,
        created_at: true,
        profiles: {
          select: {
            profile: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  }

  async createUser(req: CreateUserRequestDTO) {
    return await this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: req.name,
          email: req.email,
          phone: req.phone,
          password_hash: await bcrypt.hash(req.password, 12),
        },
      });

      await tx.userProfile.createMany({
        data: req.profile_ids.map((profileId) => ({
          user_id: user.id,
          profile_id: profileId,
        })),
      });

      return user;
    });
  }

  async updateUserWithProfiles(id: number, req: UpdateUserRequestDTO) {
    await this.db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          name: req.name,
          email: req.email,
          phone: req.phone,
          is_active: req.is_active,
        },
      });

      if (req.profile_ids !== undefined) {
        await tx.userProfile.deleteMany({ where: { user_id: id } });
        await tx.userProfile.createMany({
          data: req.profile_ids.map((profileId) => ({
            user_id: id,
            profile_id: profileId,
          })),
        });
      }
    });
  }

  async deleteUser(id: number) {
    await this.db.user.delete({ where: { id } });
  }
}
