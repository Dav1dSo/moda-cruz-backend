import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationRequestDTO } from '@shared/dtos';

const MAX_SORT_ORDER = 100_000;

export class CreateCategoryRequestDTO {
  @ApiProperty({ description: 'Nome da categoria', maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(/\S/, {
    message: 'Nome não pode ser vazio ou conter apenas espaços',
  })
  name!: string;

  @ApiProperty({
    description: 'Descrição da categoria',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'URL pública da imagem de capa da categoria',
    required: false,
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'URL da imagem inválida' })
  @MaxLength(2048)
  image_url?: string;

  @ApiProperty({
    description: 'Posição de ordenação da categoria',
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_SORT_ORDER)
  @Type(() => Number)
  sort_order?: number;

  @ApiProperty({
    description: 'Categoria ativa ou inativa',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCategoryRequestDTO {
  @ApiProperty({ description: 'Nome da categoria', maxLength: 120 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Matches(/\S/, {
    message: 'Nome não pode ser vazio ou conter apenas espaços',
  })
  name!: string;

  @ApiProperty({
    description: 'Descrição da categoria',
    required: false,
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'URL pública da imagem de capa da categoria',
    required: false,
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl({ require_protocol: true }, { message: 'URL da imagem inválida' })
  @MaxLength(2048)
  image_url?: string;

  @ApiProperty({
    description: 'Posição de ordenação da categoria',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_SORT_ORDER)
  @Type(() => Number)
  sort_order?: number;

  @ApiProperty({
    description: 'Categoria ativa ou inativa',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class GetAllCategoriesFiltersDTO extends PaginationRequestDTO {
  @ApiProperty({
    required: false,
    description: 'Busca textual por nome da categoria',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar por categorias ativas ou inativas',
  })
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : (value as unknown),
  )
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    required: false,
    description: 'Campo de ordenação',
    enum: ['sort_order', 'name'],
    default: 'sort_order',
  })
  @IsOptional()
  @IsIn(['sort_order', 'name'])
  order_by?: 'sort_order' | 'name' = 'sort_order';

  @ApiProperty({
    required: false,
    description: 'Direção da ordenação',
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order_direction?: 'asc' | 'desc' = 'asc';
}
