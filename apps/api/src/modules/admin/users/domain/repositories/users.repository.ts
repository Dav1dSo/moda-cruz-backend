import { PrismaService } from "@app/database";
import { Injectable } from "@nestjs/common";
import { CreateUserRequestDTO, UpdateUserRequestDTO } from "../../dtos/request/user-request";
import { GetAllUsersFiltersDTO } from "../../dtos/response/user-response";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserRepository {
    constructor(private readonly db: PrismaService) {}

    async getUserByEmail(email: string) {
        return await this.db.user.findFirst({
            where: {
                email: email
            }
        })
    }

    async findByEmailOrPhoneExcludingId(id: number, req: UpdateUserRequestDTO) {
        return await this.db.user.findFirst({
            where: {
                NOT: { id },
                OR: [{ email: req.email }, { phone: req.phone }],
            },
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
                filters.created_at || filters.createdAtEnd
                    ? {
                        gte: filters.created_at ? new Date(filters.created_at) : undefined,
                        lte: filters.createdAtEnd ? new Date(filters.createdAtEnd) : undefined,
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
            userId: user.id,
            profileId,
          })),
        });

        return user;
      });
    }

    async updateUser(id: number, req: UpdateUserRequestDTO) {
        await this.db.user.update({
          where: { id },
          data: {
            name: req.name,
            email: req.email,
            phone: req.phone,
            is_active: req.is_active,
          },
        });
    }

    async syncUserProfiles(userId: number, profileIds: number[]) {
        await this.db.$transaction([
            this.db.userProfile.deleteMany({ where: { userId } }),
            this.db.userProfile.createMany({
                data: profileIds.map((profileId) => ({ userId, profileId })),
            }),
        ]);
    }

    async deleteUser(id: number) {
        await this.db.user.delete({ where: { id } });
    }

}
