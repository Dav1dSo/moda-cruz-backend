import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  CreatePermissionRequestDTO,
  UpdatePermissionRequestDTO,
} from '../../dtos/request/permission-request';

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

  async delete(id: number) {
    await this.db.permission.delete({ where: { id } });
  }
}
