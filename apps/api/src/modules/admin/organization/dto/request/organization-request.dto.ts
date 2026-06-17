import { ApiProperty } from '@nestjs/swagger';
import { asaas_pix_key_type } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  isArray,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  isString,
  IsString,
  Matches,
} from 'class-validator';
import { describe } from 'node:test';

export class CreateOrganizationRequestDTO {
  @ApiProperty({ description: 'Nome da organização.' })
  @IsString()
  @IsNotEmpty()
  organization_name!: string;

  @ApiProperty({ description: 'CNPJ da organização. Apenas números' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{14}$/, {
    message: 'CNPJ deve conter exatamente 14 números',
  })
  @Transform(({ value }) =>
  typeof value === 'string'
    ? value.replace(/\D/g, '').trim()
    : value
)
  cnpj!: string;

  @ApiProperty({
    description: 'Registro municipal',
  })
  @IsString()
  municipal_registration?: string;

  @ApiProperty({ description: 'Inscrição estadual' })
  @IsString()
  state_registration?: string;

  @ApiProperty({ description: 'Status da organização' })
  @IsBoolean()
  organization_status?: boolean;

  @ApiProperty({ description: 'Observação da organização' })
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Ids de congregação para vinculo.',
    isArray: true,
    type: Number,
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  congregations_ids?: Number[];

  @ApiProperty({
    description: 'Token de Acesso da Conta',
  })
  @IsNotEmpty()
  @IsString()
  access_token_asaas!: string;

  @ApiProperty({
    description: 'Identificador da Conta (Wallet ID)',
  })
  @IsString()
  @IsNotEmpty()
  wallet_id!: string;

  @ApiProperty({
    description: 'Tipo de chave pix',
    enum: asaas_pix_key_type,
    enumName: 'asaas_pix_key_type'
  })
  @IsNotEmpty()
  @IsEnum(asaas_pix_key_type)
  pix_key_type!: asaas_pix_key_type;

  @ApiProperty({ description: 'Chave pix' })
  @IsNotEmpty()
  @IsString()
  pix_key!: string;
}
