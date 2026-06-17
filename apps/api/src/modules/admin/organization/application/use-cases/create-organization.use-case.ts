import { BadGatewayException, ConflictException, Injectable } from '@nestjs/common';
import { CreateOrganizationRequestDTO } from '../../dto/request/organization-request.dto';
import { ResponseDefaultDTO } from 'apps/api/src/shared/shared.dtos';
import { OrganizationRepository } from '../../domain/repository';
import { DocumentValidator } from 'apps/api/src/shared/utils/validate-cpf-cnpj';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    req: CreateOrganizationRequestDTO,
  ): Promise<ResponseDefaultDTO> {
    const get_organization = await this.organizationRepository.getOrganizationByName(
      req.organization_name,
    );

    if (get_organization != null) {
      throw new ConflictException('Organizaçao já cadastrada');
    }



    const cnpj_valid = DocumentValidator.validate(req.cnpj, 'CNPJ');
    if (!cnpj_valid) {
      throw new BadGatewayException("CNPJ inválido")
    }

    await this.organizationRepository.createOrganization(req);

    return { message: 'Organização criada com sucesso.' };
  }
}
