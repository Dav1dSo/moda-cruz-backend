import { Prisma } from '@prisma/client';

export function isPrismaNotFoundError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  );
}

export function isPrismaUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export function isPrismaTransactionConflictError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  );
}

export function isPrismaForeignKeyConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  );
}

export function isProductInsufficientStockError(
  error: unknown,
): error is Prisma.PrismaClientUnknownRequestError {
  return (
    error instanceof Prisma.PrismaClientUnknownRequestError &&
    error.message.includes('PRODUCT_INSUFFICIENT_STOCK')
  );
}

export function uniqueConstraintTargets(
  error: Prisma.PrismaClientKnownRequestError,
): string[] {
  const target = error.meta?.target;

  if (Array.isArray(target)) {
    return target.filter((value): value is string => typeof value === 'string');
  }

  return typeof target === 'string' ? [target] : [];
}

export function uniqueConstraintCovers(
  error: Prisma.PrismaClientKnownRequestError,
  field: string,
): boolean {
  return uniqueConstraintTargets(error).some(
    (target) => target === field || target.includes(field),
  );
}
