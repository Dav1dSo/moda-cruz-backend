import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { GetProductResponseDTO } from '../../dtos/response/product-response';

@Injectable()
export class FindProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    id: number,
    canReadCost: boolean,
  ): Promise<GetProductResponseDTO> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const stockTotal = product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? null,
      category: { id: product.category.id, name: product.category.name },
      price: product.price.toNumber(),
      cost_price: canReadCost ? (product.cost_price?.toNumber() ?? null) : null,
      status: product.status,
      rating: product.rating,
      review_count: product.review_count,
      stock_total: stockTotal,
      colors: product.colors.map((color) => ({
        id: color.id,
        name: color.name,
        hex: color.hex,
      })),
      images: product.images.map((image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt ?? null,
      })),
      variants: product.variants.map((variant) => ({
        id: variant.id,
        color: {
          id: variant.color.id,
          name: variant.color.name,
          hex: variant.color.hex,
        },
        size: variant.size,
        sku: variant.sku,
        price: variant.price?.toNumber() ?? null,
        stock: variant.stock,
      })),
      created_at: product.created_at.toISOString(),
      updated_at: product.updated_at.toISOString(),
      updated_by: product.updated_by,
    };
  }
}
