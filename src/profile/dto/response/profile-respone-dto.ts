import { ApiProperty } from '@nestjs/swagger';

export class GetAllProfilesResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  active!: boolean;

  @ApiProperty({
    type: [Number],
  })
  permissionIds!: number[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}