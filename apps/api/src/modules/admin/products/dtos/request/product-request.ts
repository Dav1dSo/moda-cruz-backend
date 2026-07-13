import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProductStatus } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaginationRequestDTO } from '@shared/dtos';

const HEX_COLOR_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

const MAX_PRODUCT_PRICE = 999999.99;

const MAX_RELATION_ARRAY_SIZE = 100;

const MAX_STOCK_FILTER = 1_000_000;

const MAX_VARIANT_STOCK = 1_000_000;

const MAX_CATEGORY_ID = 2147483647;

export class ProductColorRequestDTO {
  @ApiProperty({ description: 'Nome da cor', maxLength: 80 })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/\S/, { message: 'Nome da cor não pode conter apenas espaços' })
  name!: string;

  @ApiProperty({
    description: 'Código hexadecimal da cor, ex.: #FF0000',
    example: '#FF0000',
  })
  @IsString()
  @Matches(HEX_COLOR_PATTERN, {
    message: 'Hex deve estar no formato #RGB ou #RRGGBB',
  })
  hex!: string;
}

export class ProductImageRequestDTO {
  @ApiProperty({
    description: 'URL pública da imagem já hospedada',
    maxLength: 2048,
  })
  @MaxLength(2048)
  @IsUrl({ require_protocol: true }, { message: 'URL da imagem inválida' })
  url!: string;

  @ApiProperty({
    description: 'Texto alternativo da imagem',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string;
}

export class ProductVariantRequestDTO {
  @ApiProperty({
    description:
      'Id da variação existente a ser atualizada. Omita para criar uma variação nova.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    description:
      'Nome da cor (deve corresponder a uma cor informada no mesmo payload)',
    maxLength: 80,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/\S/, { message: 'Nome da cor não pode conter apenas espaços' })
  color_name!: string;

  @ApiProperty({ description: 'Tamanho da variação', maxLength: 32 })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @Matches(/\S/, { message: 'Tamanho não pode conter apenas espaços' })
  size!: string;

  @ApiProperty({ description: 'SKU único da variação', maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(/\S/, { message: 'SKU não pode conter apenas espaços' })
  sku!: string;

  @ApiProperty({
    description:
      'Preço específico da variação (sobrescreve o preço do produto)',
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  price?: number;

  @ApiProperty({
    description: 'Quantidade em estoque',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_VARIANT_STOCK)
  stock?: number = 0;
}

export class CreateProductRequestDTO {
  @ApiProperty({ description: 'Nome do produto', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'Nome não pode conter apenas espaços' })
  name!: string;

  @ApiProperty({
    description: 'Descrição do produto',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/\S/, { message: 'Descrição não pode conter apenas espaços' })
  description?: string;

  @ApiProperty({ description: 'Id da categoria do produto' })
  @IsInt()
  @Max(MAX_CATEGORY_ID)
  @Type(() => Number)
  category_id!: number;

  @ApiProperty({ description: 'Preço de venda do produto' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  price!: number;

  @ApiProperty({
    description:
      'Status do produto. Quando não informado, o produto é criado como RASCUNHO.',
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    description: 'Cores do produto',
    type: [ProductColorRequestDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RELATION_ARRAY_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ProductColorRequestDTO)
  colors?: ProductColorRequestDTO[];

  @ApiProperty({
    description: 'Imagens do produto',
    type: [ProductImageRequestDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RELATION_ARRAY_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ProductImageRequestDTO)
  images?: ProductImageRequestDTO[];

  @ApiProperty({
    description:
      'Variações do produto (cada color_name deve corresponder a uma cor informada em "colors")',
    type: [ProductVariantRequestDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RELATION_ARRAY_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantRequestDTO)
  variants?: ProductVariantRequestDTO[];
}

export class UpdateProductRequestDTO {
  @ApiProperty({ description: 'Nome do produto', maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, { message: 'Nome não pode conter apenas espaços' })
  name!: string;

  @ApiProperty({
    description: 'Descrição do produto',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Matches(/\S/, { message: 'Descrição não pode conter apenas espaços' })
  description?: string;

  @ApiProperty({ description: 'Id da categoria do produto' })
  @IsInt()
  @Max(MAX_CATEGORY_ID)
  @Type(() => Number)
  category_id!: number;

  @ApiProperty({ description: 'Preço de venda do produto' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  price!: number;

  @ApiProperty({
    description: 'Status do produto',
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({
    description:
      'Lista completa de cores do produto (substitui as cores existentes). Quando enviado, "variants" também deve ser enviado no mesmo request.',
    type: [ProductColorRequestDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RELATION_ARRAY_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ProductColorRequestDTO)
  colors?: ProductColorRequestDTO[];

  @ApiProperty({
    description:
      'Lista completa de imagens do produto (substitui as imagens existentes)',
    type: [ProductImageRequestDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RELATION_ARRAY_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ProductImageRequestDTO)
  images?: ProductImageRequestDTO[];

  @ApiProperty({
    description:
      'Lista completa de variações do produto (substitui as variações existentes)',
    type: [ProductVariantRequestDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_RELATION_ARRAY_SIZE)
  @ValidateNested({ each: true })
  @Type(() => ProductVariantRequestDTO)
  variants?: ProductVariantRequestDTO[];
}

export class GetAllProductsFiltersDTO extends PaginationRequestDTO {
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
  @Max(MAX_CATEGORY_ID)
  @Type(() => Number)
  category_id?: number;

  @ApiProperty({
    required: false,
    description: 'Filtrar por status do produto',
    enum: ProductStatus,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ required: false, description: 'Preço mínimo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  @Type(() => Number)
  price_min?: number;

  @ApiProperty({ required: false, description: 'Preço máximo' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(MAX_PRODUCT_PRICE)
  @Type(() => Number)
  price_max?: number;

  @ApiProperty({
    required: false,
    description: 'Estoque total mínimo (soma do estoque das variações)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_STOCK_FILTER)
  @Type(() => Number)
  stock_min?: number;

  @ApiProperty({
    required: false,
    description: 'Estoque total máximo (soma do estoque das variações)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_STOCK_FILTER)
  @Type(() => Number)
  stock_max?: number;

  @ApiProperty({
    required: false,
    description: 'Campo de ordenação',
    enum: ['name', 'price', 'stock', 'created_at'],
    default: 'created_at',
  })
  @IsOptional()
  @IsIn(['name', 'price', 'stock', 'created_at'])
  order_by?: 'name' | 'price' | 'stock' | 'created_at' = 'created_at';

  @ApiProperty({
    required: false,
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order_direction?: 'asc' | 'desc' = 'desc';
}
