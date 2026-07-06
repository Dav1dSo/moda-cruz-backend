import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class GetPermissionResponseDTO {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty()
  @IsString()
  key!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description!: string | null;

  @ApiProperty()
  @IsString()
  module!: string;

  @ApiProperty()
  @IsBoolean()
  is_critical!: boolean;

  @ApiProperty()
  @IsDateString()
  created_at!: string;

  @ApiProperty()
  @IsDateString()
  updated_at!: string;
}
