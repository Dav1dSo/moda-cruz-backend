import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { Organization, Prisma } from '@prisma/client';
import { GetAllOrganizationsFiltersDTO } from '../../dto/response/organization-response.dto';
import { CreateOrganizationRequestDTO } from '../../dto/request/organization-request.dto';


@Injectable()
export class OrganizationRepository {
  constructor(private readonly db: PrismaService) {}

  async getOrganizationByName(name: string) {
    return this.db.organization.findFirst({
      where: {
        legal_name: name,
        deleted_at: null,
      },
    });
  }

  async getOrganizationByCnpj(cnpj: string) {
    return this.db.organization.findFirst({
      where: {
        cnpj,
        deleted_at: null,
      },
    });
  }

  async getOrganizationById(id) {
    return await this.db.organization.findFirst({
      where: {
        id: id,
        deleted_at: null,
      },
    });
  }

  async getAllOrganizations(filters: GetAllOrganizationsFiltersDTO) {
    console.log('repositories');

    const where: Prisma.OrganizationWhereInput = {
      deleted_at: null,
      legal_name: filters.legal_name
        ? { contains: filters.legal_name, mode: 'insensitive' }
        : undefined,
      cnpj: filters.cnpj
        ? { contains: filters.cnpj, mode: 'insensitive' }
        : undefined,
      is_active: filters.is_active,
    };

    return await Promise.all([
      this.db.organization.count({ where }),
      this.db.organization.findMany({
        where,
        orderBy: {
          created_at: 'asc',
        },
        skip: (filters.page - 1) * filters.per_page,
        take: filters.per_page,
        select: {
          id: true,
          legal_name: true,
          cnpj: true,
          is_active: true,
          _count: {
            select: {
              congregations: true,
            },
          },
        },
      }),
    ]);
  }

  async getOrganizationDetailsById(id: number) {
    return this.db.organization.findFirst({
      where: {
        deleted_at: null,
        id: id,
      },
      select: {
        id: true,
        legal_name: true,
        created_at: true,
        cnpj: true,
        is_active: true,
        state_registration: true,
        municipal_registration: true,
        notes: true,
        asaas_integration: {
          select: {
            access_token: true,
            wallet_id: true,
            pix_key: true,
            pix_key_type: true,
            status: true,
          },
        },
        management_accounts: {
          where: { deleted_at: null },
          select: {
            id: true,
            code: true,
            name: true,
            type: true,
            is_analytic: true,
          },
        },
        congregations: {
          where: { deleted_at: null },
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async createOrganization(req: CreateOrganizationRequestDTO): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const new_organization = await tx.organization.create({
        data: {
          cnpj: req.cnpj,
          legal_name: req.organization_name,
          state_registration: req.state_registration ?? null,
          municipal_registration: req.municipal_registration ?? null,
          is_active: req.organization_status ?? true,
          notes: req.notes ?? null,
        },
      });

      await tx.organizationAsaasIntegration.create({
        data: {
          organization_id: new_organization.id,
          access_token: req.access_token_asaas,
          wallet_id: req.wallet_id,
          pix_key: req.pix_key,
          pix_key_type: req.pix_key_type,
        },
      });

      if (req.congregations_ids?.length) {
        await tx.congregation.updateMany({
          where: {
            id: {
              in: req.congregations_ids.map((id) => Number(id)),
            },
          },
          data: {
            organization_id: new_organization.id,
          },
        });
      }
    });
  }

  async updateOrganization(
    req: CreateOrganizationRequestDTO,
    organizationToUpdate: Organization,
  ) {
    await this.db.$transaction(async (tx) => {
      await tx.organization.update({
        where: {
          id: organizationToUpdate.id,
        },
        data: {
          cnpj: req.cnpj,
          legal_name: req.organization_name,
          state_registration: req.state_registration ?? null,
          municipal_registration: req.municipal_registration ?? null,
          is_active: req.organization_status ?? true,
          notes: req.notes ?? null,
        },
      });

      await tx.organizationAsaasIntegration.upsert({
        where: {
          organization_id: organizationToUpdate.id,
        },
        update: {
          access_token: req.access_token_asaas,
          wallet_id: req.wallet_id,
          pix_key: req.pix_key,
          pix_key_type: req.pix_key_type,
        },
        create: {
          organization_id: organizationToUpdate.id,
          access_token: req.access_token_asaas,
          wallet_id: req.wallet_id,
          pix_key: req.pix_key,
          pix_key_type: req.pix_key_type,
        },
      });

      if (req.congregations_ids) {
        const congregations_to_vincule = req.congregations_ids.map((id) =>
          Number(id),
        );
        const currentCongregations = await tx.congregation.findMany({
          where: { organization_id: organizationToUpdate.id },
          select: { id: true },
        });

        for (const congregation of currentCongregations) {
          if (!congregations_to_vincule.includes(congregation.id)) {
            await tx.congregation.update({
              where: {
                id: congregation.id,
              },
              data: {
                organization_id: null,
              },
            });
          }
        }

        await tx.congregation.updateMany({
          where: {
            id: {
              in: congregations_to_vincule,
            },
          },
          data: {
            organization_id: organizationToUpdate.id,
          },
        });
      }
    });
  }

  async deleteOrganization(id: number): Promise<void> {
    await this.db.$transaction(async (tx) => {
      await tx.organizationAsaasIntegration.updateMany({
        where: {
          organization_id: id,
        },
        data: {
          deleted_at: new Date(),
        },
      });

      await tx.organization.update({
        where: {
          id,
        },
        data: {
          deleted_at: new Date(),
          is_active: false,
        },
      });
    });
  }

  async hasManagementAccounts(id: number): Promise<boolean> {
    const count = await this.db.managementAccount.count({
      where: {
        organization_id: id,
        deleted_at: null,
      },
    });

    return count > 0;
  }
}
