import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaTransactionConflictError,
  isPrismaUniqueConstraintError,
  isProductInsufficientStockError,
} from '@shared/utils/prisma-errors';
import { slugify } from '@shared/utils/slugify';
import { CreateProductRequestDTO } from '../../dtos/request/product-request';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import {
  isSlugConflictError,
  resolveProductConflictMessage,
} from '../resolve-product-conflict-message';
import {
  assertNoDuplicateColorNames,
  assertNoDuplicateColorSizeCombos,
  assertNoDuplicateSkus,
  assertPublishedProductHasStock,
  assertVariantColorsExist,
} from '../validate-product-payload';

const MAX_SLUG_CREATE_ATTEMPTS = 3;
const MAX_PRODUCT_SLUG_LENGTH = 160;

@Injectable()
export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    req: CreateProductRequestDTO,
    updatedBy: number,
  ): Promise<ResponseDefaultDTO> {
    const categoryExists = await this.productRepository.categoryExists(
      req.category_id,
    );

    if (!categoryExists) {
      throw new NotFoundException('Categoria não encontrada');
    }

    const colors = req.colors ?? [];
    const variants = req.variants ?? [];

    assertNoDuplicateColorNames(colors);
    assertVariantColorsExist(
      variants,
      new Set(colors.map((color) => color.name)),
    );
    assertNoDuplicateSkus(variants);
    assertNoDuplicateColorSizeCombos(variants);
    assertPublishedProductHasStock(
      req.status ?? ProductStatus.RASCUNHO,
      variants,
    );

    if (variants.length > 0) {
      const existingSkus = await this.productRepository.findExistingSkus(
        variants.map((variant) => variant.sku),
      );

      if (existingSkus.length > 0) {
        throw new ConflictException(
          `SKU(s) já cadastrado(s): ${existingSkus.join(', ')}`,
        );
      }
    }

    for (let attempt = 1; attempt <= MAX_SLUG_CREATE_ATTEMPTS; attempt += 1) {
      const slug = await this.generateUniqueSlug(req.name.trim());

      try {
        await this.productRepository.createProduct(req, updatedBy, slug);
      } catch (error) {
        if (isPrismaUniqueConstraintError(error)) {
          if (
            isSlugConflictError(error) &&
            attempt < MAX_SLUG_CREATE_ATTEMPTS
          ) {
            continue;
          }

          throw new ConflictException(resolveProductConflictMessage(error));
        }

        if (isPrismaForeignKeyConstraintError(error)) {
          throw new NotFoundException('Categoria não encontrada');
        }

        if (isPrismaTransactionConflictError(error)) {
          throw new ConflictException(
            'Conflito ao criar o produto, tente novamente.',
          );
        }

        if (isProductInsufficientStockError(error)) {
          throw new BadRequestException(
            'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
          );
        }

        throw error;
      }

      return { message: 'Produto criado com sucesso' };
    }

    throw new ConflictException('Slug já cadastrado.');
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = slugify(name, 'produto')
      .slice(0, MAX_PRODUCT_SLUG_LENGTH)
      .replace(/-+$/, '');
    let candidate = baseSlug;
    let suffix = 1;

    while (await this.productRepository.findBySlug(candidate)) {
      suffix += 1;
      const suffixText = `-${suffix}`;
      const truncatedBase = baseSlug
        .slice(0, MAX_PRODUCT_SLUG_LENGTH - suffixText.length)
        .replace(/-+$/, '');
      candidate = `${truncatedBase}${suffixText}`.replace(/-{2,}/g, '-');
    }

    return candidate;
  }
}
