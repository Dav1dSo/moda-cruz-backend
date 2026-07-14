import { ApiProperty } from '@nestjs/swagger';
import { PromotionMediaType, PromotionStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationRequestDTO } from '@shared/dtos';

export class CreatePromotionRequestDTO {
  @ApiProperty({ description: 'Título da promoção', maxLength: 160 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  @Matches(/\S/, {
    message: 'Título não pode ser vazio ou conter apenas espaços',
  })
  title!: string;

  @ApiProperty({ description: 'Subtítulo da promoção', maxLength: 2000 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  @Matches(/\S/, {
    message: 'Subtítulo não pode ser vazio ou conter apenas espaços',
  })
  subtitle!: string;

  @ApiProperty({ description: 'Texto do botão de ação', maxLength: 80 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(/\S/, {
    message: 'Texto do botão não pode ser vazio ou conter apenas espaços',
  })
  cta_label!: string;

  @ApiProperty({
    description: 'Destino do botão de ação (URL ou caminho relativo)',
    maxLength: 255,
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @Matches(/\S/, {
    message: 'Destino do botão não pode ser vazio ou conter apenas espaços',
  })
  cta_href!: string;

  @ApiProperty({ description: 'URL da mídia da promoção', maxLength: 2048 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(1)
  @MaxLength(2048)
  @Matches(/\S/, {
    message: 'URL da mídia não pode ser vazia ou conter apenas espaços',
  })
  media_url!: string;

  @ApiProperty({
    description:
      'Tipo da mídia da promoção. Quando não informado, é criada como IMAGEM.',
    enum: PromotionMediaType,
    required: false,
  })
  @IsOptional()
  @IsEnum(PromotionMediaType)
  media_type?: PromotionMediaType;

  @ApiProperty({
    description:
      'Status da promoção. Quando não informado, é criada como RASCUNHO.',
    enum: PromotionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @ApiProperty({ description: 'Data de início da promoção' })
  @IsDateString()
  starts_at!: string;

  @ApiProperty({ description: 'Data de término da promoção' })
  @IsDateString()
  ends_at!: string;
}

export class UpdatePromotionRequestDTO extends CreatePromotionRequestDTO {}

export class GetAllPromotionsFiltersDTO extends PaginationRequestDTO {
  @ApiProperty({
    required: false,
    description: 'Busca textual por título da promoção',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;

  @ApiProperty({
    required: false,
    description: 'Filtrar por status da promoção',
    enum: PromotionStatus,
  })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;
}
