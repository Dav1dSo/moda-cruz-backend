import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionRequestDTO } from './dto/request/permisions-request-dto';
import { ResponseDefaultDTO } from '../../shared/shared.dtos';
import { PrismaService } from '@app/database';

@Injectable()
export class CreatePermissionService {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(req: CreatePermissionRequestDTO): Promise<ResponseDefaultDTO> {
    const get_permission = await this.prismaService.permission.findFirst({
      where: {
        name: req.name,
      },
    });

    if (get_permission) {
      throw new ConflictException('Permissão já cadastrada');
    }

    await this.prismaService.$transaction([
      this.prismaService.permission.create({
        data: {
          name: req.name,
          slug: req.slug,
        },
      }),
    ]);

    return { message: 'Permissão cadastrada com sucesso' };
  }
}
