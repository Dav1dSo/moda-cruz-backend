import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionRequestDTO {
  @ApiProperty({
    description: "Chave da permissão, exemplo: 'user.read' ou 'order.update'",
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Nome da permissão' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Módulo da permissão' })
  @IsString()
  @IsNotEmpty()
  module!: string;
}

export class UpdatePermissionRequestDTO {
  @ApiProperty({
    description: "Chave da permissão, exemplo: 'user.read' ou 'order.update'",
  })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: 'Nome da permissão' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Módulo da permissão' })
  @IsString()
  @IsNotEmpty()
  module!: string;
}
