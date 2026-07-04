import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';

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

  async findById(id: number) {
    return await this.db.permission.findUnique({ where: { id } });
  }

  async findAll() {
    return await this.db.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async create(data: { name: string; key: string; module: string }) {
    return await this.db.permission.create({ data });
  }

  async update(id: number, data: { name: string; key: string; module: string }) {
    await this.db.permission.update({ where: { id }, data });
  }

  async delete(id: number) {
    await this.db.permission.delete({ where: { id } });
  }
}
