import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOrganizationResponseDTO } from '../../dto/response/organization-response.dto';
import { OrganizationRepository } from '../../domain/repositories/repository';

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: number): Promise<FindOrganizationResponseDTO> {
    const organization =
      await this.organizationRepository.getOrganizationDetailsById(id);

    if (!organization) {
      throw new NotFoundException('Organização não encontrada');
    }

    const organization_data = {
      id: organization.id,
      legal_name: organization.legal_name,
      cnpj: organization.cnpj,
      created_at: organization.created_at.toISOString(),
      status: organization.is_active,
      state_registration: organization.state_registration,
      municipal_registration: organization.municipal_registration,
      notes: organization.notes,
      is_active: organization.is_active,
    };

    const managements_accounts_data = organization.management_accounts.map(
      (item) => ({
        management_account_id: item.id,
        code_management_account: item.code,
        name_account: item.name,
        type_account: item.type,
        is_analytic: item.is_analytic,
      }),
    );

    const asaas_integration_data = {
      access_token: organization.asaas_integration?.access_token ?? null,
      pix_key: organization.asaas_integration?.pix_key ?? null,
      wallet_id: organization.asaas_integration?.wallet_id ?? null,
      pix_key_type: organization.asaas_integration?.pix_key_type ?? null,
      status_integration_asaas: organization.asaas_integration?.status ?? null,
    };

    const congregation_data = organization.congregations.map((item) => ({
      id_congregation: item.id,
      name_congregation: item.name,
    }));

    return {
      organization_data: organization_data,
      management_accounts_data: managements_accounts_data,
      congregations_data: congregation_data,
      asaas_integration_data: asaas_integration_data,
    };
  }
}
