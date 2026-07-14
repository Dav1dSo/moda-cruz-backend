import { ApiProperty } from '@nestjs/swagger';
import { CouponDiscountType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationRequestDTO } from '@shared/dtos';

export class CreateCouponRequestDTO {
  @ApiProperty({
    description: 'Código do cupom (normalizado para maiúsculas)',
    maxLength: 32,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Código deve conter apenas letras, números, hífen ou underline',
  })
  code!: string;

  @ApiProperty({
    description: 'Descrição do cupom',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'Tipo do desconto (percentual ou valor fixo em reais)',
    enum: CouponDiscountType,
  })
  @IsEnum(CouponDiscountType)
  discount_type!: CouponDiscountType;

  @ApiProperty({
    description:
      'Valor do desconto (percentual de 0 a 100 ou valor fixo em reais)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  discount_value!: number;

  @ApiProperty({
    description: 'Valor mínimo de compra para aplicar o cupom',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  minimum_purchase?: number;

  @ApiProperty({
    description: 'Quantidade máxima de usos do cupom',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_uses?: number;

  @ApiProperty({
    description: 'Limite de usos por cliente',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  per_customer_limit?: number;

  @ApiProperty({
    description: 'Início da vigência do cupom',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  starts_at?: string;

  @ApiProperty({
    description: 'Fim da vigência do cupom',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  ends_at?: string;

  @ApiProperty({
    description: 'Cupom ativo ou inativo',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'ID do usuário dono do cupom (cupom pessoal)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  user_id?: number;
}

export class UpdateCouponRequestDTO extends CreateCouponRequestDTO {}

export class GetAllCouponsFiltersDTO extends PaginationRequestDTO {
  @ApiProperty({
    required: false,
    description: 'Busca textual por código ou descrição do cupom',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar por cupons ativos ou inativos',
  })
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : (value as unknown),
  )
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    required: false,
    description: 'Filtrar por tipo de desconto',
    enum: CouponDiscountType,
  })
  @IsOptional()
  @IsEnum(CouponDiscountType)
  discount_type?: CouponDiscountType;
}
