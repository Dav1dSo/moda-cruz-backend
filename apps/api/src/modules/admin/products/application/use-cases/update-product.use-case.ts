import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaNotFoundError,
  isPrismaTransactionConflictError,
  isPrismaUniqueConstraintError,
  isProductInsufficientStockError,
} from '@shared/utils/prisma-errors';
import { UpdateProductRequestDTO } from '../../dtos/request/product-request';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { resolveProductConflictMessage } from '../resolve-product-conflict-message';
import {
  assertNoDuplicateColorNames,
  assertNoDuplicateColorSizeCombos,
  assertNoDuplicateSkus,
  assertPublishedProductHasStock,
  assertVariantColorsExist,
} from '../validate-product-payload';

const CATEGORY_FK_CONSTRAINT = 'products_category_id_fkey';
const ORDER_ITEM_VARIANT_FK_CONSTRAINT = 'order_items_product_variant_id_fkey';
const VARIANT_COLOR_FK_CONSTRAINT = 'product_variants_product_color_id_fkey';

@Injectable()
export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    req: UpdateProductRequestDTO,
    id: number,
    updatedBy: number,
  ): Promise<ResponseDefaultDTO> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const categoryExists = await this.productRepository.categoryExists(
      req.category_id,
    );

    if (!categoryExists) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (req.colors !== undefined && req.variants === undefined) {
      throw new BadRequestException(
        'Ao atualizar as cores do produto, a lista de variações também deve ser enviada no mesmo request.',
      );
    }

    if (req.colors !== undefined) {
      assertNoDuplicateColorNames(req.colors);
    }

    const resolvedStatus = req.status ?? product.status;
    let externalColorNameToId: Map<string, number> | undefined;

    if (req.variants !== undefined) {
      assertNoDuplicateSkus(req.variants);
      assertNoDuplicateColorSizeCombos(req.variants);

      if (req.colors !== undefined) {
        assertVariantColorsExist(
          req.variants,
          new Set(req.colors.map((color) => color.name)),
        );
      } else {
        const existingColors =
          await this.productRepository.findColorsByProduct(id);

        assertVariantColorsExist(
          req.variants,
          new Set(existingColors.map((color) => color.name)),
        );

        externalColorNameToId = new Map(
          existingColors.map((color) => [
            color.name.trim().toLowerCase(),
            color.id,
          ]),
        );
      }

      const variantIdsInPayload = req.variants
        .map((variant) => variant.id)
        .filter((variantId): variantId is number => variantId !== undefined);

      if (variantIdsInPayload.length > 0) {
        const ownedVariantIds =
          await this.productRepository.findVariantIdsBelongingToProduct(
            id,
            variantIdsInPayload,
          );

        const ownedVariantIdsSet = new Set(ownedVariantIds);
        const hasForeignVariant = variantIdsInPayload.some(
          (variantId) => !ownedVariantIdsSet.has(variantId),
        );

        if (hasForeignVariant) {
          throw new BadRequestException(
            'Uma ou mais variações informadas não pertencem a este produto.',
          );
        }
      }

      if (req.variants.length > 0) {
        const conflictingSkus =
          await this.productRepository.findConflictingVariantSkus(
            id,
            req.variants,
          );

        if (conflictingSkus.length > 0) {
          throw new ConflictException(
            `SKU(s) já cadastrado(s): ${conflictingSkus.join(', ')}`,
          );
        }
      }

      assertPublishedProductHasStock(resolvedStatus, req.variants);
    }

    try {
      await this.productRepository.updateProductWithRelations(
        id,
        req,
        updatedBy,
        externalColorNameToId,
      );
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictException(resolveProductConflictMessage(error));
      }

      if (isPrismaNotFoundError(error)) {
        throw new ConflictException(
          'Produto foi alterado por outra operação, tente novamente.',
        );
      }

      if (isPrismaForeignKeyConstraintError(error)) {
        const constraint = error.meta?.constraint;

        if (constraint === CATEGORY_FK_CONSTRAINT) {
          throw new NotFoundException('Categoria não encontrada');
        }

        if (constraint === ORDER_ITEM_VARIANT_FK_CONSTRAINT) {
          throw new BadRequestException(
            'Não é possível remover: uma ou mais variações possuem pedidos associados. Mantenha essas variações na lista para preservar o histórico de pedidos.',
          );
        }

        if (constraint === VARIANT_COLOR_FK_CONSTRAINT) {
          throw new BadRequestException(
            'Uma ou mais cores referenciadas pelas variações foram alteradas por outra operação, tente novamente.',
          );
        }

        throw new BadRequestException(
          'Conflito ao salvar as relações do produto (categoria ou cor pode ter sido alterada por outra operação); tente novamente.',
        );
      }

      if (isPrismaTransactionConflictError(error)) {
        throw new ConflictException(
          'Conflito ao atualizar o produto, tente novamente.',
        );
      }

      if (isProductInsufficientStockError(error)) {
        throw new BadRequestException(
          'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
        );
      }

      throw error;
    }

    return { message: 'Produto atualizado com sucesso' };
  }
}
