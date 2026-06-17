import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsString,
  Matches,
} from 'class-validator';

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
