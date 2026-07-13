import { ApiProperty } from '@nestjs/swagger';
import { PaginationResponseDTO } from '@shared/dtos';

export class PublicCategorySummaryDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;
}

export class PublicProductColorDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  hex!: string;
}

export class PublicProductImageDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  url!: string;

  @ApiProperty({ required: false })
  alt!: string | null;
}

export class PublicProductVariantDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: PublicProductColorDTO })
  color!: PublicProductColorDTO;

  @ApiProperty()
  size!: string;

  @ApiProperty({ required: false })
  price!: number | null;

  @ApiProperty()
  stock!: number;
}

export class PublicProductListItemDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: PublicCategorySummaryDTO })
  category!: PublicCategorySummaryDTO;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  review_count!: number;

  @ApiProperty({ required: false })
  main_image_url!: string | null;

  @ApiProperty({ description: 'Soma do estoque de todas as variações' })
  stock_total!: number;
}

export class GetAllPublicProductsResponseDTO {
  @ApiProperty({ type: [PublicProductListItemDTO] })
  data!: PublicProductListItemDTO[];

  @ApiProperty({ type: PaginationResponseDTO })
  pagination!: PaginationResponseDTO;
}

export class GetPublicProductResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false })
  description!: string | null;

  @ApiProperty({ type: PublicCategorySummaryDTO })
  category!: PublicCategorySummaryDTO;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  review_count!: number;

  @ApiProperty({ description: 'Soma do estoque de todas as variações' })
  stock_total!: number;

  @ApiProperty({ type: [PublicProductColorDTO] })
  colors!: PublicProductColorDTO[];

  @ApiProperty({ type: [PublicProductImageDTO] })
  images!: PublicProductImageDTO[];

  @ApiProperty({ type: [PublicProductVariantDTO] })
  variants!: PublicProductVariantDTO[];
}
