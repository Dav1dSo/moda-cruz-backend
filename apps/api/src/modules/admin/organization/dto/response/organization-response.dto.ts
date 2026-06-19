import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { asaas_integration_status, asaas_pix_key_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  PaginationRequestDTO,
  PaginationResponseDTO,
} from 'apps/api/src/shared/shared.dtos';

export class OrganizationAsaasIntegrationResponseDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  wallet_id?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pix_key?: string | null;

  @ApiPropertyOptional({
    enum: asaas_pix_key_type,
    enumName: 'asaas_pix_key_type',
  })
  @IsOptional()
  pix_key_type?: asaas_pix_key_type | null;

  @ApiProperty({
    enum: asaas_integration_status,
    enumName: 'asaas_integration_status',
  })
  status!: asaas_integration_status;
}

export class OrganizationCongregationResponseDTO {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsBoolean()
  is_active!: boolean;
}

export class OrganizationResponseDTO {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty()
  @IsString()
  cnpj!: string;

  @ApiProperty()
  @IsString()
  legal_name!: string;

  @ApiProperty()
  @IsBoolean()
  is_active!: boolean;

  @ApiProperty()
  @IsInt()
  @Type(() => Number)
  count_congregations!: number;
}

export class GetAllOrganizationsResponseDTO {
  @ApiProperty()
  data!: OrganizationResponseDTO[];

  @ApiProperty()
  pagination!: PaginationResponseDTO;
}

export class GetAllOrganizationsFiltersDTO extends PaginationRequestDTO {
  @ApiPropertyOptional({ required: false, description: 'Filtrar por nome' })
  @IsOptional()
  @IsString()
  legal_name?: string;

  @ApiPropertyOptional({ required: false, description: 'Filtrar por CNPJ' })
  @IsOptional()
  @IsString()
  cnpj?: string;

  @ApiProperty({ required: false, description: 'Status da organização' })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is_active?: boolean;
}


export class AsaasOrganizationReponseDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  access_token!: string | null;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  wallet_id!: string | null;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  pix_key!: string | null;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  pix_key_type!: string | null;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  status_integration_asaas!: asaas_integration_status | null;
}

export class ManagementAccountOrganizationReponseDTO {
  @ApiProperty()
  @IsInt()
  management_account_id!: number;
  
  @ApiProperty()
  @IsString()
  code_management_account!: string;
  
  @ApiProperty()
  @IsString()
  name_account!: string;
  
  @ApiProperty()
  @IsString()
  type_account!: string;
  
  @ApiProperty()
  @IsBoolean()
  is_analytic!: boolean;
}


export class CongregationOrganizationReponseDTO {
  @ApiProperty()
  @IsInt()
  id_congregation!: number;
  
  @ApiProperty()
  @IsString()
  name_congregation!: string;
}
export class OrganizationRespondeDTO {
  @ApiProperty()
  @IsNumber()
  @Type(() => Number)
  id!: number;

  @ApiProperty()
  @IsString()
  legal_name!: string;

  @ApiProperty()
  @IsString()
  created_at!: string;

  @ApiProperty()
  @IsString()
  cnpj!: string;

  @ApiProperty()
  @IsBoolean()
  is_active!: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  state_registration!: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  municipal_registration!: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  notes!: string | null;
}

export class FindOrganizationResponseDTO {
  @ApiProperty({
    type: OrganizationRespondeDTO,
    isArray: true
  })
  organization_data!: OrganizationRespondeDTO

  @ApiProperty({
    type: ManagementAccountOrganizationReponseDTO,
    isArray: true
  })
  management_accounts_data!: ManagementAccountOrganizationReponseDTO[]

  @ApiProperty({
    type: CongregationOrganizationReponseDTO,
    isArray: true
  })
  congregations_data!: CongregationOrganizationReponseDTO[]

  @ApiProperty({
    type: AsaasOrganizationReponseDTO,
    isArray: true
  })
  asaas_integration_data!: AsaasOrganizationReponseDTO

}