import { ApiProperty } from '@nestjs/swagger';

export class GetAllCategoriesResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description!: string | null;

  @ApiProperty({ required: false })
  image_url!: string | null;

  @ApiProperty()
  sort_order!: number;

  @ApiProperty()
  is_active!: boolean;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}

export class GetCategoryResponseDTO extends GetAllCategoriesResponseDTO {}
