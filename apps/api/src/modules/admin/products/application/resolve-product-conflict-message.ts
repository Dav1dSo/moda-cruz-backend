import { Prisma } from '@prisma/client';

function extractConflictFields(
  error: Prisma.PrismaClientKnownRequestError,
): string[] {
  const target = error.meta?.target;
  const values: unknown[] = Array.isArray(target)
    ? (target as unknown[])
    : typeof target === 'string'
      ? [target]
      : [];

  return values.filter((value): value is string => typeof value === 'string');
}

export function isSlugConflictError(
  error: Prisma.PrismaClientKnownRequestError,
): boolean {
  return extractConflictFields(error).includes('slug');
}

export function resolveProductConflictMessage(
  error: Prisma.PrismaClientKnownRequestError,
): string {
  const fields = extractConflictFields(error);

  if (fields.includes('slug')) {
    return 'Slug já cadastrado.';
  }

  if (fields.includes('sku')) {
    return 'SKU já cadastrado.';
  }

  if (fields.includes('product_color_id') && fields.includes('size')) {
    return 'Já existe uma variação com essa cor e tamanho para este produto.';
  }

  if (fields.includes('product_id') && fields.includes('name')) {
    return 'Já existe uma cor com esse nome para este produto.';
  }

  return 'Conflito de dados ao salvar o produto, tente novamente.';
}
