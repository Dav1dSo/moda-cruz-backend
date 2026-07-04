import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionRequestDTO } from '../../dto/request/permisions-request-dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { PermissionRepository } from '../../domain/repositories/permission.repository';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(
    id: number,
    req: CreatePermissionRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new NotFoundException('Permissão não encontrada');
    }

    const permissionExists = await this.permissionRepository.findByNameExcludingId(
      id,
      req.name,
    );

    if (permissionExists) {
      throw new ConflictException('Permissão já cadastrada');
    }

    await this.permissionRepository.update(id, req);

    return {
      message: 'Permissão atualizada com sucesso',
    };
  }
}
