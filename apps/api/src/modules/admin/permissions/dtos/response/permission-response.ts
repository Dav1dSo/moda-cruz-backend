import { ApiProperty } from '@nestjs/swagger';

export class GetPermissionResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  key!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  description!: string | null;

  @ApiProperty()
  module!: string;

  @ApiProperty()
  is_critical!: boolean;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
