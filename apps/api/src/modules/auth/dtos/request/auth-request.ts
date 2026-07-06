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
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class RefreshTokenRequestDTO {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken!: string;
}

export class ResetPasswordRequestDTO {
  @ApiProperty({ description: 'Email usado para login' })
  @IsString()
  email!: string;
}

export class ConfirmResetPasswordRequestDTO {
  @ApiProperty({ description: 'Token enviado por email' })
  @IsString()
  token!: string;

  @ApiProperty({ description: 'Email' })
  @IsString()
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
