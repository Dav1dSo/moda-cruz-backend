import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
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
  is_active!: boolean;

  @ApiProperty({
    description: 'Ids de permissões vinculadas',
    type: Number,
    isArray: true,
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  permission_ids!: number[];
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
  is_active?: string;
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
  is_active?: boolean;
}
