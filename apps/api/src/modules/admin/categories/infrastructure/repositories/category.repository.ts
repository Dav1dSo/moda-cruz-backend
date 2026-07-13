import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  CreateCategoryRequestDTO,
  GetAllCategoriesFiltersDTO,
  UpdateCategoryRequestDTO,
} from '../../dtos/request/category-request';

@Injectable()
export class CategoryRepository {
  constructor(private readonly db: PrismaService) {}

  async findBySlug(slug: string) {
    return await this.db.category.findUnique({
      where: { slug },
      select: { id: true },
    });
  }

  async findAll(filters: GetAllCategoriesFiltersDTO) {
    const where = {
      name: filters.name
        ? { contains: filters.name, mode: 'insensitive' as const }
        : undefined,
      is_active: filters.is_active,
    };

    const orderDirection = filters.order_direction ?? 'asc';
    const orderBy =
      filters.order_by === 'name'
        ? { name: orderDirection }
        : { sort_order: orderDirection };

    return await this.db.category.findMany({
      where,
      orderBy,
      take: filters.per_page,
      skip: (filters.page - 1) * filters.per_page,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
        sort_order: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async findById(id: number) {
    return await this.db.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image_url: true,
        sort_order: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  async createCategory(req: CreateCategoryRequestDTO, slug: string) {
    return await this.db.category.create({
      data: {
        name: req.name,
        slug,
        description: req.description,
        image_url: req.image_url,
        sort_order: req.sort_order ?? 0,
        is_active: req.is_active ?? true,
      },
    });
  }

  async updateCategory(id: number, req: UpdateCategoryRequestDTO) {
    await this.db.category.update({
      where: { id },
      data: {
        name: req.name,
        description: req.description,
        image_url: req.image_url,
        sort_order: req.sort_order,
        is_active: req.is_active,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.db.category.delete({ where: { id } });
  }

  async countProducts(categoryId: number): Promise<number> {
    return await this.db.product.count({
      where: { category_id: categoryId },
    });
  }
}
