import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import {
  CreateProductRequestDTO,
  GetAllProductsFiltersDTO,
  ProductVariantRequestDTO,
  UpdateProductRequestDTO,
} from '../../dtos/request/product-request';
import { ProductListRow } from './product-list-row';

const ORDER_COLUMN_SQL: Record<string, string> = {
  name: 'p.name',
  price: 'p.price',
  stock: 'stock_total',
  created_at: 'p.created_at',
};

const PRODUCT_RELATIONS_TRANSACTION_TIMEOUT_MS = 20_000;
const PRODUCT_RELATIONS_TRANSACTION_MAX_WAIT_MS = 10_000;

function requireColorId(
  colorNameToId: Map<string, number>,
  colorName: string,
): number {
  const colorId = colorNameToId.get(colorName.trim().toLowerCase());

  if (colorId === undefined) {
    throw new Error(`Cor "${colorName}" sem id resolvido para a variação.`);
  }

  return colorId;
}

@Injectable()
export class ProductRepository {
  constructor(private readonly db: PrismaService) {}

  async categoryExists(id: number): Promise<boolean> {
    const category = await this.db.category.findUnique({
      where: { id },
      select: { id: true },
    });

    return category !== null;
  }

  async findBySlug(slug: string) {
    return await this.db.product.findUnique({
      where: { slug },
      select: { id: true },
    });
  }

  async findExistingSkus(skus: string[]): Promise<string[]> {
    if (skus.length === 0) return [];

    const variants = await this.db.productVariant.findMany({
      where: {
        OR: skus.map((sku) => ({
          sku: {
            equals: sku.trim().toLowerCase(),
            mode: 'insensitive' as const,
          },
        })),
      },
      select: { sku: true },
    });

    return variants.map((variant) => variant.sku);
  }

  async findConflictingVariantSkus(
    productId: number,
    variants: ProductVariantRequestDTO[],
  ): Promise<string[]> {
    if (variants.length === 0) return [];

    const rows = await this.db.productVariant.findMany({
      where: {
        product_id: { not: productId },
        OR: variants.map((variant) => ({
          sku: {
            equals: variant.sku.trim().toLowerCase(),
            mode: 'insensitive' as const,
          },
        })),
      },
      select: { sku: true },
    });

    return rows.map((row) => row.sku);
  }

  async findVariantIdsBelongingToProduct(
    productId: number,
    variantIds: number[],
  ): Promise<number[]> {
    if (variantIds.length === 0) return [];

    const variants = await this.db.productVariant.findMany({
      where: { id: { in: variantIds }, product_id: productId },
      select: { id: true },
    });

    return variants.map((variant) => variant.id);
  }

  async findColorsByProduct(
    productId: number,
  ): Promise<{ id: number; name: string }[]> {
    return await this.db.productColor.findMany({
      where: { product_id: productId },
      select: { id: true, name: true },
    });
  }

  async findAll(filters: GetAllProductsFiltersDTO): Promise<ProductListRow[]> {
    const conditions = [
      filters.search
        ? Prisma.sql`(p.name ILIKE ${`%${filters.search}%`} OR p.description ILIKE ${`%${filters.search}%`})`
        : null,
      filters.category_id !== undefined
        ? Prisma.sql`p.category_id = ${filters.category_id}`
        : null,
      filters.status !== undefined
        ? Prisma.sql`p.status = ${filters.status}::product_status`
        : null,
      filters.price_min !== undefined
        ? Prisma.sql`p.price >= ${filters.price_min}`
        : null,
      filters.price_max !== undefined
        ? Prisma.sql`p.price <= ${filters.price_max}`
        : null,
    ].filter((condition): condition is Prisma.Sql => condition !== null);

    const where = conditions.length
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
      : Prisma.empty;

    const havingConditions = [
      filters.stock_min !== undefined
        ? Prisma.sql`COALESCE(SUM(v.stock), 0) >= ${filters.stock_min}`
        : null,
      filters.stock_max !== undefined
        ? Prisma.sql`COALESCE(SUM(v.stock), 0) <= ${filters.stock_max}`
        : null,
    ].filter((condition): condition is Prisma.Sql => condition !== null);

    const having = havingConditions.length
      ? Prisma.sql`HAVING ${Prisma.join(havingConditions, ' AND ')}`
      : Prisma.empty;

    const orderColumn = ORDER_COLUMN_SQL[filters.order_by ?? 'created_at'];
    const orderDirection = filters.order_direction === 'asc' ? 'ASC' : 'DESC';

    return await this.db.$queryRaw<ProductListRow[]>(Prisma.sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.category_id,
        c.name AS category_name,
        p.price::text AS price,
        p.status::text AS status,
        p.rating,
        p.review_count,
        p.created_at,
        COALESCE(SUM(v.stock), 0)::int AS stock_total,
        (
          SELECT pi.url FROM product_images pi
          WHERE pi.product_id = p.id
          ORDER BY pi.id ASC
          LIMIT 1
        ) AS main_image_url
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants v ON v.product_id = p.id
      ${where}
      GROUP BY p.id, c.name
      ${having}
      ORDER BY ${Prisma.raw(orderColumn)} ${Prisma.raw(orderDirection)}
      LIMIT ${filters.per_page}
      OFFSET ${(filters.page - 1) * filters.per_page}
    `);
  }

  async findById(id: number) {
    return await this.db.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        cost_price: true,
        status: true,
        rating: true,
        review_count: true,
        created_at: true,
        updated_at: true,
        updated_by: true,
        category: {
          select: { id: true, name: true },
        },
        colors: {
          select: { id: true, name: true, hex: true },
          orderBy: { id: 'asc' },
        },
        images: {
          select: { id: true, url: true, alt: true },
          orderBy: { id: 'asc' },
        },
        variants: {
          select: {
            id: true,
            size: true,
            sku: true,
            price: true,
            stock: true,
            color: {
              select: { id: true, name: true, hex: true },
            },
          },
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  async createProduct(
    req: CreateProductRequestDTO,
    updatedBy: number,
    slug: string,
  ): Promise<void> {
    await this.db.$transaction(
      async (tx) => {
        const product = await tx.product.create({
          data: {
            category_id: req.category_id,
            name: req.name.trim(),
            slug,
            description: req.description?.trim(),
            price: req.price,
            status: req.status ?? ProductStatus.RASCUNHO,
            updated_by: updatedBy,
          },
        });

        const colors = req.colors ?? [];
        const colorNameToId = new Map<string, number>();

        if (colors.length > 0) {
          const createdColors = await tx.productColor.createManyAndReturn({
            data: colors.map((color) => ({
              product_id: product.id,
              name: color.name.trim(),
              hex: color.hex,
            })),
          });

          for (const createdColor of createdColors) {
            colorNameToId.set(
              createdColor.name.trim().toLowerCase(),
              createdColor.id,
            );
          }
        }

        const images = req.images ?? [];

        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image) => ({
              product_id: product.id,
              url: image.url,
              alt: image.alt,
            })),
          });
        }

        const variants = req.variants ?? [];

        if (variants.length === 0) return;

        await tx.productVariant.createMany({
          data: variants.map((variant) => ({
            product_id: product.id,
            product_color_id: requireColorId(colorNameToId, variant.color_name),
            size: variant.size.trim(),
            sku: variant.sku.trim().toLowerCase(),
            price: variant.price,
            stock: variant.stock ?? 0,
          })),
        });
      },
      {
        timeout: PRODUCT_RELATIONS_TRANSACTION_TIMEOUT_MS,
        maxWait: PRODUCT_RELATIONS_TRANSACTION_MAX_WAIT_MS,
      },
    );
  }

  async updateProductWithRelations(
    id: number,
    req: UpdateProductRequestDTO,
    updatedBy: number,
    externalColorNameToId?: Map<string, number>,
  ): Promise<void> {
    await this.db.$transaction(
      async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            category_id: req.category_id,
            name: req.name.trim(),
            description: req.description?.trim(),
            price: req.price,
            status: req.status,
            updated_by: updatedBy,
          },
        });

        if (req.images !== undefined) {
          await tx.productImage.deleteMany({ where: { product_id: id } });

          if (req.images.length > 0) {
            await tx.productImage.createMany({
              data: req.images.map((image) => ({
                product_id: id,
                url: image.url,
                alt: image.alt,
              })),
            });
          }
        }

        let colorNameToId = externalColorNameToId;
        let colorIdsToRemove: number[] = [];

        if (req.colors !== undefined) {
          const existingColors = await tx.productColor.findMany({
            where: { product_id: id },
            select: { id: true, name: true },
          });

          const existingColorsByNormalizedName = new Map(
            existingColors.map((color) => [
              color.name.trim().toLowerCase(),
              color,
            ]),
          );

          const resolvedColorNameToId = new Map<string, number>();

          for (const color of req.colors) {
            const normalizedName = color.name.trim().toLowerCase();
            const existingColor =
              existingColorsByNormalizedName.get(normalizedName);

            const savedColor = existingColor
              ? await tx.productColor.update({
                  where: { id: existingColor.id },
                  data: { name: color.name.trim(), hex: color.hex },
                  select: { id: true },
                })
              : await tx.productColor.create({
                  data: {
                    product_id: id,
                    name: color.name.trim(),
                    hex: color.hex,
                  },
                  select: { id: true },
                });

            resolvedColorNameToId.set(normalizedName, savedColor.id);
          }

          colorNameToId = resolvedColorNameToId;

          const survivingColorIds = new Set(resolvedColorNameToId.values());
          colorIdsToRemove = existingColors
            .filter((color) => !survivingColorIds.has(color.id))
            .map((color) => color.id);
        }

        let resolvedVariants:
          | Array<ProductVariantRequestDTO & { product_color_id: number }>
          | undefined;
        let variantIdsToRemove: number[] = [];
        let variantIdsInPayload: number[] = [];

        if (req.variants !== undefined) {
          if (colorNameToId === undefined) {
            throw new Error(
              'Mapa de cores ausente ao resolver as variações do produto.',
            );
          }

          const colorLookup = colorNameToId;

          resolvedVariants = req.variants.map((variant) => ({
            ...variant,
            size: variant.size.trim(),
            product_color_id: requireColorId(colorLookup, variant.color_name),
          }));

          variantIdsInPayload = resolvedVariants
            .map((variant) => variant.id)
            .filter(
              (variantId): variantId is number => variantId !== undefined,
            );

          const existingVariants = await tx.productVariant.findMany({
            where: { product_id: id },
            select: { id: true },
          });

          variantIdsToRemove = existingVariants
            .map((variant) => variant.id)
            .filter((variantId) => !variantIdsInPayload.includes(variantId));
        }

        if (colorIdsToRemove.length > 0) {
          const variantsUnderRemovedColors = await tx.productVariant.findMany({
            where: {
              product_id: id,
              product_color_id: { in: colorIdsToRemove },
              id: { notIn: variantIdsInPayload },
            },
            select: { id: true },
          });

          for (const variant of variantsUnderRemovedColors) {
            if (!variantIdsToRemove.includes(variant.id)) {
              variantIdsToRemove.push(variant.id);
            }
          }
        }

        if (variantIdsToRemove.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: variantIdsToRemove } },
          });
        }

        if (resolvedVariants !== undefined) {
          const existingVariantsToUpdate = resolvedVariants.filter(
            (
              variant,
            ): variant is (typeof resolvedVariants)[number] & {
              id: number;
            } => variant.id !== undefined,
          );

          const newVariants = resolvedVariants.filter(
            (variant) => variant.id === undefined,
          );

          for (const variant of existingVariantsToUpdate) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                sku: `__tmp_sku_${variant.id}_${randomUUID()}`,
                size: `__tmp_size_${variant.id}`,
              },
            });
          }

          if (newVariants.length > 0) {
            await tx.productVariant.createMany({
              data: newVariants.map((variant) => ({
                product_id: id,
                product_color_id: variant.product_color_id,
                size: variant.size,
                sku: variant.sku.trim().toLowerCase(),
                price: variant.price,
                stock: variant.stock ?? 0,
              })),
            });
          }

          for (const variant of existingVariantsToUpdate) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                product_color_id: variant.product_color_id,
                size: variant.size,
                sku: variant.sku.trim().toLowerCase(),
                price: variant.price,
                stock: variant.stock ?? 0,
              },
            });
          }
        }

        if (colorIdsToRemove.length > 0) {
          await tx.productColor.deleteMany({
            where: { id: { in: colorIdsToRemove } },
          });
        }
      },
      {
        timeout: PRODUCT_RELATIONS_TRANSACTION_TIMEOUT_MS,
        maxWait: PRODUCT_RELATIONS_TRANSACTION_MAX_WAIT_MS,
      },
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.product.delete({ where: { id } });
  }

  async countDependents(productId: number): Promise<number> {
    const [orderItemsCount, reviewsCount, returnItemsCount] = await Promise.all(
      [
        this.db.orderItem.count({ where: { product_id: productId } }),
        this.db.productReview.count({ where: { product_id: productId } }),
        this.db.returnRequestItem.count({ where: { product_id: productId } }),
      ],
    );

    return orderItemsCount + reviewsCount + returnItemsCount;
  }
}
