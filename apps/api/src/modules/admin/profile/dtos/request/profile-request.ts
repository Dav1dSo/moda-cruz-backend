import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationRequestDTO } from 'apps/api/src/shared/shared.dtos';

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

export class GetAllProfilesRequestDTO extends PaginationRequestDTO {
  @ApiProperty({
    description: 'Nome do perfil',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Status do perfil',
    required: false,
  })
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : (value as unknown),
  )
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
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
