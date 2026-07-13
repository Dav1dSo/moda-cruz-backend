import { Injectable } from '@nestjs/common';
import { PublicProductRepository } from '../../infrastructure/repositories/public-product.repository';
import { GetAllPublicProductsFiltersDTO } from '../../dtos/request/public-product-request';
import {
  GetAllPublicProductsResponseDTO,
  PublicProductListItemDTO,
} from '../../dtos/response/public-product-response';

@Injectable()
export class GetAllPublicProductsUseCase {
  constructor(
    private readonly publicProductRepository: PublicProductRepository,
  ) {}

  async execute(
    filters: GetAllPublicProductsFiltersDTO,
  ): Promise<GetAllPublicProductsResponseDTO> {
    const [rows, total] = await Promise.all([
      this.publicProductRepository.findAll(filters),
      this.publicProductRepository.count(filters),
    ]);

    const data: PublicProductListItemDTO[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
      price: Number(row.price),
      rating: row.rating,
      review_count: row.review_count,
      main_image_url: row.main_image_url,
      stock_total: row.stock_total,
    }));

    return {
      data,
      pagination: {
        page: filters.page,
        per_page: filters.per_page,
        total,
        total_pages: Math.ceil(total / filters.per_page),
      },
    };
  }
}
