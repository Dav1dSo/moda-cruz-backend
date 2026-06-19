import { Injectable } from '@nestjs/common';
import { GetAllOrganizationsFiltersDTO, GetAllOrganizationsResponseDTO } from '../../dto/response/organization-response.dto';
import { OrganizationResponseDTO } from '../../dto/response/organization-response.dto';
import { cnpj } from 'cpf-cnpj-validator';
import { response } from 'express';
import { OrganizationRepository } from '../../domain/repositories/repository';

@Injectable()
export class GetAllOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(
    filters: GetAllOrganizationsFiltersDTO,
  ): Promise<GetAllOrganizationsResponseDTO> {

    console.log('controller')

    const [total, result] = await this.organizationRepository.getAllOrganizations(filters);

    const response = result.map((item) => ({
      legal_name: item.legal_name,
      cnpj: item.cnpj,
      is_active: item.is_active,
      count_congregations: item._count.congregations,
      id: item.id
    }))

    const meta = {
      per_page: filters.per_page,
      page: filters.page,
      total: total,
      total_pages: Math.ceil(total / filters.per_page)
    }

    return {
      data: response,
      pagination: meta
    }

  }
}
  