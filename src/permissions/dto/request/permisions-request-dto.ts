import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionRequestDTO {
  @ApiProperty({
    description: "Slug da permissão exemplo: 'users.read - users.delete'",
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ description: 'Nome da permissão' })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
