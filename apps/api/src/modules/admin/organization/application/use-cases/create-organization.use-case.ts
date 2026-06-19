import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateOrganizationRequestDTO } from '../../dto/request/organization-request.dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { DocumentValidator } from 'apps/api/src/shared/utils/validate-cpf-cnpj';
import { OrganizationRepository } from '../../domain/repositories/repository';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    req: CreateOrganizationRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    const organizationByName =
      await this.organizationRepository.getOrganizationByName(
        req.organization_name,
      );

    if (organizationByName) {
      throw new ConflictException('Organização já cadastrada');
    }

    const organizationByCnpj =
      await this.organizationRepository.getOrganizationByCnpj(req.cnpj);

    if (organizationByCnpj) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    const cnpjValid = DocumentValidator.validate(req.cnpj, 'CNPJ');
    if (!cnpjValid) {
      throw new BadRequestException('CNPJ inválido');
    }

    await this.organizationRepository.createOrganization(req);

    return { message: 'Organização criada com sucesso.' };
  }
}
