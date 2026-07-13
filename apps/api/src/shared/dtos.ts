import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class ResponseDefaultDTO {
  @ApiProperty()
  message!: string;
}

export class PaginationRequestDTO {
  @ApiProperty({ description: 'Numero da pagina', default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page = 1;

  @ApiProperty({ description: 'Numero de itens por pagina', default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  per_page = 10;
}

export class PaginationResponseDTO {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  per_page!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  total_pages!: number;
}
