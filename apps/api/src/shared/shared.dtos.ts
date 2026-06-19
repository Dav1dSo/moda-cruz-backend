import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ResponseDefaultDTO {
  @ApiProperty()
  @IsString()
  message!: string;
}

export class PaginationRequestDTO {
  @ApiProperty({ description: 'Numero da pagina', default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page = 1;

  @ApiProperty({ description: 'Numero de itens por pagina', default: 10 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  per_page = 10;
}

export class PaginationResponseDTO {
  @ApiProperty()
  @IsInt()
  page!: number;

  @ApiProperty()
  @IsInt()
  per_page!: number;

  @ApiProperty()
  @IsInt()
  total!: number;

  @ApiProperty()
  @IsInt()
  total_pages!: number;
}
