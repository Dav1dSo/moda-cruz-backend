import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthLoginRequestDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(72)
  password!: string;
}

export class ResetPasswordRequestDTO {
  @ApiProperty({ description: 'Email usado para login' })
  @IsEmail()
  @MaxLength(255)
  email!: string;
}

export class ConfirmResetPasswordRequestDTO {
  @ApiProperty({ description: 'Token enviado por email' })
  @IsString()
  @MaxLength(2048)
  token!: string;

  @ApiProperty({ description: 'Email' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ description: 'Nova senha', minLength: 8, maxLength: 20 })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+]).*$/, {
    message:
      'A senha deve conter ao menos uma letra maiúscula e um número e um símbolo',
  })
  new_password!: string;
}

export class RegisterRequestDTO {
  @ApiProperty({ description: 'Nome completo' })
  @IsString()
  @MaxLength(255)
  @Matches(/^[A-Za-zÀ-ÿ\s]+$/)
  name!: string;

  @ApiProperty({ description: 'Endereço de email válido' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ description: 'Número de phone válido' })
  @IsString()
  @MaxLength(32)
  phone!: string;

  @ApiProperty({
    minLength: 8,
    maxLength: 20,
    description:
      'Senha com 8-20 caracteres, incluindo letra maiúscula, número e símbolo',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+]).*$/, {
    message:
      'A senha deve conter ao menos uma letra maiúscula e um número e um símbolo',
  })
  password!: string;
}
