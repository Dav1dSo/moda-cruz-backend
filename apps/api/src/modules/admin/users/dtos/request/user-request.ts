import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationRequestDTO } from 'apps/api/src/shared/shared.dtos';

export class CreateUserRequestDTO {
  @ApiProperty({ description: 'Nome completo' })
  @IsString()
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/)
  name!: string;

  @ApiProperty({ description: 'Endereço de email válido' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Número de phone válido' })
  @IsString()
  phone!: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 20,
    description:
      'Senha com 8-20 caracteres, incluindo letras maiúsculas, números e símbolos',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+]).*$/, {
    message:
      'A senha deve conter ao menos uma letra maiúscula e um número e um símbolo',
  })
  password!: string;

  @ApiProperty({
    description: 'Ids de perfis vinculados ao usuário',
    type: Number,
    isArray: true,
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  profile_ids: number[] = [];
}

export class UpdateUserRequestDTO {
  @ApiProperty({ description: 'Endereço de email válido' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'Nome completo' })
  @IsString()
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/)
  name!: string;

  @ApiProperty({ description: 'Número de phone válido' })
  @IsString()
  phone!: string;

  @ApiProperty({ description: 'Status do usuário', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({
    description: 'Ids de perfis vinculados ao usuário',
    type: Number,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  profile_ids?: number[];
}

export class GetAllUsersFiltersDTO extends PaginationRequestDTO {
  @ApiProperty({ required: false, description: 'Filtrar por nome' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, description: 'Filtrar por email' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false, description: 'Filtro data criação inicial' })
  @IsDateString()
  @IsOptional()
  created_at_start?: string;

  @ApiProperty({ required: false, description: 'Filtro data criação final' })
  @IsDateString()
  @IsOptional()
  created_at_end?: string;
}
