import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, isInt, IsOptional, IsString } from 'class-validator';

export class ResponseDefaultDTO {
  @ApiProperty()
  @IsString()
  message!: string;
}

export class PaginationDTO {
  @ApiProperty({ description: 'Número da página', default: 1 })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @ApiProperty({ description: 'Número de itens por página', default: 10 })
  @Type(() => Number)
  @IsInt()  
  @IsOptional()
  per_page: number = 10;
}
