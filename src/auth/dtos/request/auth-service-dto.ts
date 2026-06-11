import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

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

  @ApiProperty({ description: 'Nova senha' })
  @IsString()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()-+]).*$/, {
    message:
      'A senha deve conter ao menos uma letra maiúscula e um número e um símbolo',
  })
  new_password!: string;
}
