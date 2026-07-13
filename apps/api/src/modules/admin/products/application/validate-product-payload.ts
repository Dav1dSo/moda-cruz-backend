import { BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import {
  ProductColorRequestDTO,
  ProductVariantRequestDTO,
} from '../dtos/request/product-request';

export function assertNoDuplicateColorNames(
  colors: ProductColorRequestDTO[],
): void {
  const uniqueNames = new Set(
    colors.map((color) => color.name.trim().toLowerCase()),
  );

  if (uniqueNames.size !== colors.length) {
    throw new BadRequestException('Existem cores repetidas no mesmo produto.');
  }
}

export function assertNoDuplicateSkus(
  variants: ProductVariantRequestDTO[],
): void {
  const uniqueSkus = new Set(
    variants.map((variant) => variant.sku.trim().toLowerCase()),
  );

  if (uniqueSkus.size !== variants.length) {
    throw new BadRequestException('Existem SKUs repetidos no mesmo produto.');
  }
}

export function assertNoDuplicateColorSizeCombos(
  variants: ProductVariantRequestDTO[],
): void {
  const uniqueCombos = new Set(
    variants.map(
      (variant) =>
        `${variant.color_name.trim().toLowerCase()}::${variant.size.trim()}`,
    ),
  );

  if (uniqueCombos.size !== variants.length) {
    throw new BadRequestException(
      'Existem variações repetidas com a mesma cor e tamanho.',
    );
  }
}

export function assertVariantColorsExist(
  variants: ProductVariantRequestDTO[],
  availableColorNames: Set<string>,
): void {
  const normalizedAvailableNames = new Set(
    Array.from(availableColorNames, (name) => name.trim().toLowerCase()),
  );

  const missingVariant = variants.find(
    (variant) =>
      !normalizedAvailableNames.has(variant.color_name.trim().toLowerCase()),
  );

  if (missingVariant) {
    throw new BadRequestException(
      `A cor "${missingVariant.color_name}" informada em uma variação não corresponde a nenhuma cor do produto.`,
    );
  }
}

export function assertPublishedProductHasStock(
  status: ProductStatus | undefined,
  variants: { stock?: number | null }[],
): void {
  if (status !== ProductStatus.PUBLICADO) return;

  const hasStockAvailable = variants.some(
    (variant) => (variant.stock ?? 0) > 0,
  );

  if (!hasStockAvailable) {
    throw new BadRequestException(
      'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
    );
  }
}
