import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class ResponseDefaultDTO {
  @ApiProperty()
  @IsString()
  message!: string;
}

export class PaginationDTO {
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
