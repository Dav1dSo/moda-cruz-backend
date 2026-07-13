import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { GetAllCategoriesFiltersDTO } from '../../dtos/request/category-request';
import { GetAllCategoriesResponseDTO } from '../../dtos/response/category-response';

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    filters: GetAllCategoriesFiltersDTO,
  ): Promise<GetAllCategoriesResponseDTO[]> {
    const categories = await this.categoryRepository.findAll(filters);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      image_url: category.image_url ?? null,
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    }));
  }
}
