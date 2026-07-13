import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { GetAllPublicCategoriesFiltersDTO } from '../../dtos/request/public-category-request';

@Injectable()
export class PublicCategoryRepository {
  constructor(private readonly db: PrismaService) {}

  async findAll(filters: GetAllPublicCategoriesFiltersDTO) {
    return await this.db.category.findMany({
      where: {
        is_active: true,
        name: filters.search
          ? { contains: filters.search, mode: 'insensitive' as const }
          : undefined,
      },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        image_url: true,
      },
    });
  }
}
