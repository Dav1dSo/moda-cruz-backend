import { ApiProperty } from '@nestjs/swagger';
import { PaginationRequestDTO } from 'apps/api/src/shared/shared.dtos';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetAllUsersResponseDTO {
  @ApiProperty()
  @IsInt()
  id!: number;

  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsDateString()
  created_at!: string;
}

export class GetAllUsersFiltersDTO extends PaginationRequestDTO {
  @ApiProperty({ required: false, description: 'Filtrar por nome' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, description: 'Filtrar por email' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: 'Filtro data criação inicial' })
  @IsDateString()
  @IsOptional()
  created_at?: string;

  @ApiProperty({ required: false, description: 'Filtro data criação final' })
  @IsDateString()
  @IsOptional()
  createdAtEnd?: string;
}

export class GetUserResponseDTO extends GetAllUsersResponseDTO {}
