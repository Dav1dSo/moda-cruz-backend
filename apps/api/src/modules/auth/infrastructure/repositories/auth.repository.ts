import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDTO } from '../../dtos/request/auth-request';

const USER_WITH_PERMISSIONS_SELECT = {
  id: true,
  name: true,
  email: true,
  is_platform_admin: true,
  deleted_at: true,
  is_active: true,
  profiles: {
    select: {
      profile: {
        select: {
          id: true,
          name: true,
          permissions: {
            select: {
              permission: {
                select: {
                  key: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.UserSelect;

@Injectable()
export class AuthRepository {
  constructor(private readonly db: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email, deleted_at: null },
      select: {
        ...USER_WITH_PERMISSIONS_SELECT,
        password_hash: true,
      },
    });
  }

  async findUserWithPermissionsByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email, deleted_at: null },
      select: USER_WITH_PERMISSIONS_SELECT,
    });
  }

  async findBasicByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email, deleted_at: null },
      select: { id: true, name: true, email: true },
    });
  }

  async updateLastLogin(userId: number) {
    await this.db.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    });
  }

  async findForPasswordResetByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email, deleted_at: null },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        is_active: true,
        deleted_at: true,
      },
    });
  }

  async findPasswordHashByIdAndEmail(id: number, email: string) {
    return await this.db.user.findFirst({
      where: { id, email },
      select: {
        id: true,
        password_hash: true,
        is_active: true,
        deleted_at: true,
      },
    });
  }

  async findForRefreshById(id: number) {
    return await this.db.user.findFirst({
      where: { id },
      select: {
        ...USER_WITH_PERMISSIONS_SELECT,
        password_hash: true,
      },
    });
  }

  async updatePassword(userId: number, passwordHash: string) {
    await this.db.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });
  }

  async createCustomerUser(req: RegisterRequestDTO) {
    return await this.db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: req.name,
          email: req.email,
          phone: req.phone,
          password_hash: await bcrypt.hash(req.password, 12),
        },
      });

      await tx.customer.create({
        data: {
          user_id: user.id,
          code: `CLI${String(user.id).padStart(6, '0')}`,
          name: req.name,
          email: req.email,
          phone: req.phone,
        },
      });

      return user;
    });
  }
}
