import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsJWT,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { StringifyOptions } from 'node:querystring';

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
  name!: String;

  @ApiProperty({ description: 'Status de usuário' })
  @IsBoolean()
  is_plataform_admin!: boolean;
}

export class AvaliableOrganizationsResponseDTO {
  @ApiProperty({
    description: 'Id da organização',
  })
  @IsNumber()
  organization_id!: number;

  @ApiProperty({
    description: 'Nome da organização',
  })
  @IsString()
  organization_name!: string;

  @ApiProperty({
    description: 'Id da organização',
  })
  @IsNumber()
  congregation_vinculo_id!: number;

  @ApiProperty({
    description: 'Nome da congregação',
  })
  @IsString()
  congregation_name!: string;

  @ApiProperty({
    description: 'Verificação pendente?',
  })
  @IsBoolean()
  is_active!: boolean;
}

export class RequiredLoginResponseDTO {
  @ApiProperty({
    description: 'Pré token de autorização',
  })
  @IsString()
  selection_token_organization!: string;

  @ApiProperty({ type: UserResponseDTO })
  @ValidateNested()
  @Type(() => UserResponseDTO)
  user!: UserResponseDTO;

  avaliable_organizations!: AvaliableOrganizationsResponseDTO[];
}

export class AuthLoginResponseDTO {
  @IsJWT()
  @ApiProperty({ description: 'Access token' })
  accessToken!: string;

  @IsJWT()
  @ApiProperty({ description: 'Access token' })
  refreshToken!: string;
}

export class RefreshTokenResponseDTO {
  @ApiProperty({ description: 'Access token' })
  @IsString()
  accessToken!: string;
}
