import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GetAllPublicCategoriesFiltersDTO {
  @ApiProperty({
    required: false,
    description: 'Busca textual por nome da categoria',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}
