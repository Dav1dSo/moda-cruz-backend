import { ApiProperty } from '@nestjs/swagger';
import { ProductStatus } from '@prisma/client';

export class CategorySummaryDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}

export class ProductColorResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  hex!: string;
}

export class ProductImageResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  url!: string;

  @ApiProperty({ required: false })
  alt!: string | null;
}

export class ProductVariantResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: ProductColorResponseDTO })
  color!: ProductColorResponseDTO;

  @ApiProperty()
  size!: string;

  @ApiProperty()
  sku!: string;

  @ApiProperty({ required: false })
  price!: number | null;

  @ApiProperty()
  stock!: number;
}

export class GetAllProductsResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ type: CategorySummaryDTO })
  category!: CategorySummaryDTO;

  @ApiProperty()
  price!: number;

  @ApiProperty({ enum: ProductStatus })
  status!: ProductStatus;

  @ApiProperty({ description: 'Soma do estoque de todas as variações' })
  stock_total!: number;

  @ApiProperty({ required: false })
  main_image_url!: string | null;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  review_count!: number;

  @ApiProperty()
  created_at!: string;
}

export class GetProductResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty({ required: false })
  description!: string | null;

  @ApiProperty({ type: CategorySummaryDTO })
  category!: CategorySummaryDTO;

  @ApiProperty()
  price!: number;

  @ApiProperty({ enum: ProductStatus })
  status!: ProductStatus;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  review_count!: number;

  @ApiProperty({ description: 'Soma do estoque de todas as variações' })
  stock_total!: number;

  @ApiProperty({ type: [ProductColorResponseDTO] })
  colors!: ProductColorResponseDTO[];

  @ApiProperty({ type: [ProductImageResponseDTO] })
  images!: ProductImageResponseDTO[];

  @ApiProperty({ type: [ProductVariantResponseDTO] })
  variants!: ProductVariantResponseDTO[];

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;

  @ApiProperty({
    description: 'Id do usuário administrativo que fez a última alteração',
  })
  updated_by!: number;
}
