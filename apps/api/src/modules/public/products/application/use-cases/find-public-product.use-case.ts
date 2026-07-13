import { Injectable, NotFoundException } from '@nestjs/common';
import { PublicProductRepository } from '../../infrastructure/repositories/public-product.repository';
import { GetPublicProductResponseDTO } from '../../dtos/response/public-product-response';

@Injectable()
export class FindPublicProductUseCase {
  constructor(
    private readonly publicProductRepository: PublicProductRepository,
  ) {}

  async execute(slug: string): Promise<GetPublicProductResponseDTO> {
    const product = await this.publicProductRepository.findBySlug(slug);

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const stockTotal = product.variants.reduce(
      (total, variant) => total + variant.stock,
      0,
    );

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description ?? null,
      category: {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      },
      price: product.price.toNumber(),
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
        price: variant.price?.toNumber() ?? null,
        stock: variant.stock,
      })),
    };
  }
}
