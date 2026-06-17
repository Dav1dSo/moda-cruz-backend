import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationRequestDTO } from '../../dto/request/organization-request.dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { OrganizationRepository } from '../../domain/repository';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    req: CreateOrganizationRequestDTO,
    id: Number,
  ): Promise<ResponseDefaultDTO> {
    const organization =
      await this.organizationRepository.getOrganizationById(id);

    if (!organization) {
      throw new NotFoundException('Organização não encontrada');
    }

    const valida_nome = await this.organizationRepository.getOrganizationByName(
      req.organization_name,
    );

    if (valida_nome != null) {
      if (valida_nome.id !== id) {
        throw new ConflictException('Nome de organização já cadastrado');
      }
    }

    await this.organizationRepository.updateOrganization(req, organization);

    return { message: 'Organização atualizada com sucesso.' };
  }
}
