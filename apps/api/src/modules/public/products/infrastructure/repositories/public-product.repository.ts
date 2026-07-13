import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { GetAllPublicProductsFiltersDTO } from '../../dtos/request/public-product-request';
import { PublicProductListRow } from './public-product-list-row';

const ORDER_BY_SQL: Record<string, string> = {
  relevance: 'p.review_count DESC, p.created_at DESC',
  'price-asc': 'p.price ASC',
  'price-desc': 'p.price DESC',
  rating: 'p.rating DESC, p.review_count DESC',
  newest: 'p.created_at DESC',
  'stock-asc': 'stock_total ASC',
};

@Injectable()
export class PublicProductRepository {
  constructor(private readonly db: PrismaService) {}

  private buildWhereConditions(
    filters: GetAllPublicProductsFiltersDTO,
  ): Prisma.Sql[] {
    const sizesLower = (filters.sizes ?? []).map((size) =>
      size.trim().toLowerCase(),
    );
    const colorsLower = (filters.colors ?? []).map((color) =>
      color.trim().toLowerCase(),
    );

    return [
      Prisma.sql`p.status = ${ProductStatus.PUBLICADO}::product_status`,
      Prisma.sql`c.is_active = true`,
      filters.search
        ? Prisma.sql`(p.name ILIKE ${`%${filters.search}%`} OR p.description ILIKE ${`%${filters.search}%`})`
        : null,
      filters.category_id !== undefined
        ? Prisma.sql`p.category_id = ${filters.category_id}`
        : null,
      filters.category_slug !== undefined
        ? Prisma.sql`c.slug = ${filters.category_slug}`
        : null,
      filters.price_min !== undefined
        ? Prisma.sql`p.price >= ${filters.price_min}`
        : null,
      filters.price_max !== undefined
        ? Prisma.sql`p.price <= ${filters.price_max}`
        : null,
      filters.min_rating !== undefined
        ? Prisma.sql`p.rating >= ${filters.min_rating}`
        : null,
      sizesLower.length > 0
        ? Prisma.sql`EXISTS (
            SELECT 1 FROM product_variants pv
            WHERE pv.product_id = p.id
              AND LOWER(pv.size) = ANY(ARRAY[${Prisma.join(sizesLower)}]::text[])
          )`
        : null,
      colorsLower.length > 0
        ? Prisma.sql`EXISTS (
            SELECT 1 FROM product_colors pc
            WHERE pc.product_id = p.id
              AND LOWER(pc.name) = ANY(ARRAY[${Prisma.join(colorsLower)}]::text[])
          )`
        : null,
    ].filter((condition): condition is Prisma.Sql => condition !== null);
  }

  async findAll(
    filters: GetAllPublicProductsFiltersDTO,
  ): Promise<PublicProductListRow[]> {
    const where = Prisma.sql`WHERE ${Prisma.join(this.buildWhereConditions(filters), ' AND ')}`;
    const orderBy = Prisma.raw(ORDER_BY_SQL[filters.sort]);

    return await this.db.$queryRaw<PublicProductListRow[]>(Prisma.sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.price::text AS price,
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
      GROUP BY p.id, c.name, c.slug
      ORDER BY ${orderBy}
      LIMIT ${filters.per_page}
      OFFSET ${(filters.page - 1) * filters.per_page}
    `);
  }

  async count(filters: GetAllPublicProductsFiltersDTO): Promise<number> {
    const where = Prisma.sql`WHERE ${Prisma.join(this.buildWhereConditions(filters), ' AND ')}`;

    const rows = await this.db.$queryRaw<{ total: number }[]>(Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      ${where}
    `);

    return rows[0]?.total ?? 0;
  }

  async findBySlug(slug: string) {
    return await this.db.product.findFirst({
      where: {
        slug,
        status: ProductStatus.PUBLICADO,
        category: { is_active: true },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        price: true,
        rating: true,
        review_count: true,
        category: {
          select: { id: true, name: true, slug: true },
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
}
