import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PaginationDTO } from 'src/shared/shared.dtos';

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

export class CreateUserRequestDTO {
  @ApiProperty({ description: 'Nome completo' })
  @IsString()
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/)
  name!: string;

  @ApiProperty({ description: 'Endereço de email válido' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Número de telefone válido' })
  @IsString()
  telefone!: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 20,
    pattern: '^[^@]+@[^@]+\\.[^@]+$',
    description:
      'Senha com 8-20 caracteres, incluindo letras maiúsculas, números e símbolos',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+]).*$/, {
    message:
      'A senha deve conter ao menos uma letra maiúscula e um número e um símbolo',
  })
  @IsString()
  password!: string;

  @ApiProperty({ description: 'Rua' })
  @IsString()
  street!: string;

  @ApiProperty({ description: 'Cidade' })
  @IsString()
  city!: string;

  @ApiProperty({ description: 'Estado' })
  @IsString()
  state!: string;

  @ApiProperty({ description: 'CEP' })
  @IsString()
  zipCode!: string;

  @ApiProperty({ description: 'País' })
  @IsString()
  country!: string;

  @ApiProperty({ description: 'Número' })
  @IsString()
  number!: string;
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
