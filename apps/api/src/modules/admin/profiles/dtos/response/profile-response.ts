import { ApiProperty } from '@nestjs/swagger';

export class GetAllProfilesResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  is_active!: boolean;

  @ApiProperty({
    type: [Number],
  })
  permission_ids!: number[];

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}
