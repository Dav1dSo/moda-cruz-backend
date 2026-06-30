import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsJWT,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UserResponseDTO {
  @ApiProperty({
    description: 'Id de usuário',
  })
  @IsNumber()
  id!: number;

  @ApiProperty({ description: 'Email do usuário' })
  @IsString()
  email!: string;

  @ApiProperty({
    description: 'Nome de usuário',
  })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Status de usuário' })
  @IsBoolean()
  is_platform_admin!: boolean;
}

export class ProfileResponseDTO {
  @ApiProperty({
    description: 'Id do perfil',
  })
  @IsNumber()
  id!: number;

  @ApiProperty({
    description: 'Nome do perfil',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: 'Permissões do perfil',
    type: [String],
  })
  permissions!: string[];
}

export class RequiredLoginResponseDTO {
  @ApiProperty({
    description: 'Access token',
  })
  @IsString()
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token',
  })
  @IsString()
  refreshToken!: string;

  @ApiProperty({ type: UserResponseDTO })
  @ValidateNested()
  @Type(() => UserResponseDTO)
  user!: UserResponseDTO;

  @ApiProperty({
    type: [ProfileResponseDTO],
  })
  @ValidateNested({ each: true })
  @Type(() => ProfileResponseDTO)
  profiles!: ProfileResponseDTO[];
}

export class AuthLoginResponseDTO {
  @IsJWT()
  @ApiProperty({ description: 'Access token' })
  accessToken!: string;

  @IsJWT()
  @ApiProperty({ description: 'Refresh token' })
  refreshToken!: string;
}

export class RefreshTokenResponseDTO {
  @ApiProperty({ description: 'Access token' })
  @IsString()
  accessToken!: string;
}
