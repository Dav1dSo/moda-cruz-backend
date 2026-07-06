import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  CreatePermissionRequestDTO,
  UpdatePermissionRequestDTO,
} from '../../dtos/request/permission-request';
import { isPrismaNotFoundError } from 'apps/api/src/shared/utils/prisma-errors';

@Injectable()
export class PermissionRepository {
  constructor(private readonly db: PrismaService) {}

  async findByName(name: string) {
    return await this.db.permission.findFirst({ where: { name } });
  }

  async findByNameExcludingId(id: number, name: string) {
    return await this.db.permission.findFirst({
      where: { name, NOT: { id } },
    });
  }

  async findByKey(key: string) {
    return await this.db.permission.findFirst({ where: { key } });
  }

  async findByKeyExcludingId(id: number, key: string) {
    return await this.db.permission.findFirst({
      where: { key, NOT: { id } },
    });
  }

  async findById(id: number) {
    return await this.db.permission.findUnique({ where: { id } });
  }

  async findAll() {
    return await this.db.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async create(req: CreatePermissionRequestDTO) {
    return await this.db.permission.create({
      data: {
        name: req.name,
        key: req.key,
        module: req.module,
      },
    });
  }

  async update(id: number, req: UpdatePermissionRequestDTO) {
    await this.db.permission.update({
      where: { id },
      data: {
        name: req.name,
        key: req.key,
        module: req.module,
      },
    });
  }

  async countByIds(ids: number[]) {
    return await this.db.permission.count({
      where: { id: { in: ids } },
    });
  }

  async deleteIfUnused(id: number): Promise<{
    deleted: boolean;
    dependentsCount: number;
    notFound?: boolean;
  }> {
    return await this.db.$transaction(async (tx) => {
      const dependentsCount = await tx.profilePermission.count({
        where: { permission_id: id },
      });

      if (dependentsCount > 0) {
        return { deleted: false, dependentsCount };
      }

      try {
        await tx.permission.delete({ where: { id } });
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
