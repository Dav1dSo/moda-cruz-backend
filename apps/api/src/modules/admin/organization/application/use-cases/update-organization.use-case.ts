import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationRequestDTO } from '../../dto/request/organization-request.dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { OrganizationRepository } from '../../domain/repositories/repository';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    req: CreateOrganizationRequestDTO,
    id: number,
  ): Promise<ResponseDefaultDTO> {
    const organization =
      await this.organizationRepository.getOrganizationById(id);

    if (!organization) {
      throw new NotFoundException('Organização não encontrada');
    }

    const organizationByName =
      await this.organizationRepository.getOrganizationByName(
        req.organization_name,
      );

    if (organizationByName && organizationByName.id !== id) {
      throw new ConflictException('Nome de organização já cadastrado');
    }

    const organizationByCnpj =
      await this.organizationRepository.getOrganizationByCnpj(req.cnpj);

    if (organizationByCnpj && organizationByCnpj.id !== id) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    await this.organizationRepository.updateOrganization(req, organization);

    return { message: 'Organização atualizada com sucesso.' };
  }
}
