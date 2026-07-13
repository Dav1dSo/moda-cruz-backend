import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { GetCategoryResponseDTO } from '../../dtos/response/category-response';

@Injectable()
export class FindCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: number): Promise<GetCategoryResponseDTO | null> {
    const category = await this.categoryRepository.findById(id);

    if (!category) return null;

    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      image_url: category.image_url ?? null,
      sort_order: category.sort_order,
      is_active: category.is_active,
      created_at: category.created_at.toISOString(),
      updated_at: category.updated_at.toISOString(),
    };
  }
}
