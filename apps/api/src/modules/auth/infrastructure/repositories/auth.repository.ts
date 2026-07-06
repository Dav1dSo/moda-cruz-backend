import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';
import * as bcrypt from 'bcrypt';
import { RegisterRequestDTO } from '../../dtos/request/auth-request';

@Injectable()
export class AuthRepository {
  constructor(private readonly db: PrismaService) {}

  /**
   * Select comum de usuário + perfis + permissões, usado pelas variantes de
   * busca de usuário para autenticação. Nunca inclui `password_hash` — a
   * única variante que precisa do hash (`getUserByEmail`) o adiciona
   * explicitamente por cima deste select base.
   */
  private get userWithPermissionsSelect() {
    return {
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
    } as const;
  }

  async getUserByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email },
      select: {
        ...this.userWithPermissionsSelect,
        password_hash: true,
      },
    });
  }

  async findUserWithPermissionsByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email },
      select: this.userWithPermissionsSelect,
    });
  }

  async findUserWithPermissionsById(id: number) {
    return await this.db.user.findFirst({
      where: { id },
      select: this.userWithPermissionsSelect,
    });
  }

  async findBasicByEmail(email: string) {
    return await this.db.user.findFirst({
      where: { email },
      select: { id: true, name: true, email: true },
    });
  }

  async updateLastLogin(userId: number) {
    await this.db.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    });
  }

  async findByIdAndEmail(id: number, email: string) {
    return await this.db.user.findFirst({
      where: { id, email },
      select: { id: true, email: true },
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
