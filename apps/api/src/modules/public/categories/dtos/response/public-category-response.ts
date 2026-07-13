import { ApiProperty } from '@nestjs/swagger';

export class GetAllPublicCategoriesResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  image_url!: string | null;
}
