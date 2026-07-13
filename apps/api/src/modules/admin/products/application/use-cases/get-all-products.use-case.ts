import { Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { GetAllProductsFiltersDTO } from '../../dtos/request/product-request';
import { GetAllProductsResponseDTO } from '../../dtos/response/product-response';

@Injectable()
export class GetAllProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    filters: GetAllProductsFiltersDTO,
  ): Promise<GetAllProductsResponseDTO[]> {
    const rows = await this.productRepository.findAll(filters);

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: { id: row.category_id, name: row.category_name },
      price: Number(row.price),
      status: row.status as ProductStatus,
      stock_total: row.stock_total,
      main_image_url: row.main_image_url ?? null,
      rating: row.rating,
      review_count: row.review_count,
      created_at: row.created_at.toISOString(),
    }));
  }
}
