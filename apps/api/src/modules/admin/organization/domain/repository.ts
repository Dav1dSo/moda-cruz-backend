import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { CreateOrganizationRequestDTO } from '../dto/request/organization-request.dto';
import { Organization } from '@prisma/client';

@Injectable()
export class OrganizationRepository {
  constructor(private readonly db: PrismaService) {}

  async getOrganizationByName(name: string) {
    return this.db.organization.findFirst({
      where: {
        legal_name: name,
      },
    });
  }

  async getOrganizationById(id) {
    return await this.db.organization.findFirst({
      where: {
        id: id,
      },
    });
  }

  async createOrganization(req: CreateOrganizationRequestDTO): Promise<void> {
    await this.db.$transaction(async (tx) => {
      const new_organization = await tx.organization.create({
        data: {
          cnpj: req.cnpj,
          legal_name: req.organization_name,
          state_registration: req.state_registration,
          municipal_registration: req.municipal_registration,
          is_active: req.organization_status,
          notes: req.notes,
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
              in: req.congregations_ids.map((ids) => Number(ids)),
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
          state_registration: req.state_registration,
          municipal_registration: req.municipal_registration,
          is_active: req.organization_status,
          notes: req.notes,
        },
      });

      await tx.organizationAsaasIntegration.update({
        where: {
          organization_id: organizationToUpdate.id,
        },
        data: {
          access_token: req.access_token_asaas,
          wallet_id: req.wallet_id,
          pix_key: req.pix_key,
          pix_key_type: req.pix_key_type,
        },
      });

      if (req.congregations_ids?.length) {

        const congregations_to_vincule = req.congregations_ids.map((ids) => Number(ids))

        const currentCongregations = await tx.congregation.findMany({
          where: { organization_id: organizationToUpdate.id },
          select: { id: true },
        });

        for (const congregation of currentCongregations) {
          if (!congregations_to_vincule.includes(congregation.id)) {
            await tx.congregation.update({
              where: {
                id: congregation.id
              },
              data:  {
                organization_id: null
              }
            })
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
}
