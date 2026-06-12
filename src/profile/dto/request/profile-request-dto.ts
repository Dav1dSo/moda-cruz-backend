import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateProfileRequestDTO {
  @ApiProperty({
    description: 'Nome do pérfil',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Status do pérfil',
    default: true,
  })
  @IsBoolean()
  active!: boolean;

  @ApiProperty({ description: 'Ids de permissões vinculadas' })
  @IsArray()
  @IsInt({ each: true })
  permissionIds!: number[];
}

export class GetAllProfilesRequestDTO {
  @ApiProperty({
    description: 'Nome do perfil',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Status do perfil',
  })
  @IsOptional()
  @IsBoolean()
  active?: string;
}

export class UpdateProfileRequestDTO {
  @ApiProperty({
    description: 'Nome do perfil',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Status do perfil',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}