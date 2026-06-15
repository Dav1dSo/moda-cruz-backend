import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/database';

@Injectable()
export class GetAllPermissionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute() {
    return await this.prismaService.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }
}