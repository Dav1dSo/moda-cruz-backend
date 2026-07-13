import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDTO {
  @ApiProperty({
    description: 'Id de usuário',
  })
  id!: number;

  @ApiProperty({ description: 'Email do usuário' })
  email!: string;

  @ApiProperty({
    description: 'Nome de usuário',
  })
  name!: string;

  @ApiProperty({ description: 'Status de usuário' })
  is_platform_admin!: boolean;
}

export class ProfileResponseDTO {
  @ApiProperty({
    description: 'Id do perfil',
  })
  id!: number;

  @ApiProperty({
    description: 'Nome do perfil',
  })
  name!: string;

  @ApiProperty({
    description: 'Permissões do perfil',
    type: [String],
  })
  permissions!: string[];
}

export class LoginWithRefreshTokenResponseDTO {
  @ApiProperty({
    description: 'Access token',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token',
  })
  refreshToken!: string;

  @ApiProperty({ type: UserResponseDTO })
  user!: UserResponseDTO;

  @ApiProperty({
    type: [ProfileResponseDTO],
  })
  profiles!: ProfileResponseDTO[];
}

export class LoginResponseDTO {
  @ApiProperty({
    description: 'Access token',
  })
  accessToken!: string;

  @ApiProperty({ type: UserResponseDTO })
  user!: UserResponseDTO;

  @ApiProperty({
    type: [ProfileResponseDTO],
  })
  profiles!: ProfileResponseDTO[];
}

export class RefreshTokenResponseDTO {
  @ApiProperty({ description: 'Access token' })
  accessToken!: string;
}

export class MeResponseDTO {
  @ApiProperty({ type: UserResponseDTO })
  user!: UserResponseDTO;

  @ApiProperty({
    type: [ProfileResponseDTO],
  })
  profiles!: ProfileResponseDTO[];
}
