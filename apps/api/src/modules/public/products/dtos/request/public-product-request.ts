import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationRequestDTO } from '@shared/dtos';

const MAX_PRODUCT_PRICE = 999999.99;

const MAX_CATEGORY_ID = 2147483647;

const MAX_FILTER_ARRAY_SIZE = 50;

const MAX_RATING = 5;

export const PUBLIC_PRODUCT_SORT_VALUES = [
  'relevance',
  'price-asc',
  'price-desc',
  'rating',
  'newest',
  'stock-asc',
] as const;

export type PublicProductSort = (typeof PUBLIC_PRODUCT_SORT_VALUES)[number];

function toStringArray({ value }: { value: unknown }): unknown {
  if (value === undefined) return value;
  return Array.isArray(value) ? value : [value];
}

export class GetAllPublicProductsFiltersDTO extends PaginationRequestDTO {
  @ApiProperty({
    required: false,
    description: 'Busca textual por nome ou descrição do produto',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiProperty({ required: false, description: 'Filtrar por id da categoria' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(MAX_CATEGORY_ID)
  @Type(() => Number)
  category_id?: number;

  @ApiProperty({
    required: false,
    description: 'Filtrar por slug da categoria',
    maxLength: 140,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @MaxLength(140)
  category_slug?: string;

  @ApiProperty({ required: false, description: 'Preço mínimo' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  @Type(() => Number)
  price_min?: number;

  @ApiProperty({ required: false, description: 'Preço máximo' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  @Type(() => Number)
  price_max?: number;

  @ApiProperty({
    required: false,
    description: 'Tamanhos de variação desejados',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @ArrayMaxSize(MAX_FILTER_ARRAY_SIZE)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(32, { each: true })
  sizes?: string[];

  @ApiProperty({
    required: false,
    description: 'Nomes de cores desejadas',
    type: String,
    isArray: true,
  })
  @IsOptional()
  @Transform(toStringArray)
  @IsArray()
  @ArrayMaxSize(MAX_FILTER_ARRAY_SIZE)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  @MaxLength(80, { each: true })
  colors?: string[];

  @ApiProperty({ required: false, description: 'Nota mínima de avaliação' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_RATING)
  @Type(() => Number)
  min_rating?: number;

  @ApiProperty({
    required: false,
    description:
      'Critério de ordenação. "relevance" (padrão) usa número de avaliações como proxy de popularidade, pois não há contagem real de vendas no schema.',
    enum: PUBLIC_PRODUCT_SORT_VALUES,
    default: 'relevance',
  })
  @IsOptional()
  @IsIn(PUBLIC_PRODUCT_SORT_VALUES)
  sort: PublicProductSort = 'relevance';
}
