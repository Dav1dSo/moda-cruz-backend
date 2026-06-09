import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEmail, IsInt, IsOptional, IsString } from "class-validator";
import { PaginationDTO } from "src/shared/shared.dtos";

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
  createdAt!: string;
}

export class GetAllUsersFiltersDTO extends PaginationDTO {
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
  createdAt?: string;

  @ApiProperty({ required: false, description: 'Filtro data criação final' })
  @IsDateString()
  @IsOptional()
  createdAtEnd?: string;
}

export class GetUserResponseDTO extends GetAllUsersResponseDTO {}