import { Injectable } from '@nestjs/common';
import { PublicCategoryRepository } from '../../infrastructure/repositories/public-category.repository';
import { GetAllPublicCategoriesFiltersDTO } from '../../dtos/request/public-category-request';
import { GetAllPublicCategoriesResponseDTO } from '../../dtos/response/public-category-response';

@Injectable()
export class GetAllPublicCategoriesUseCase {
  constructor(
    private readonly publicCategoryRepository: PublicCategoryRepository,
  ) {}

  async execute(
    filters: GetAllPublicCategoriesFiltersDTO,
  ): Promise<GetAllPublicCategoriesResponseDTO[]> {
    const categories = await this.publicCategoryRepository.findAll(filters);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image_url: category.image_url,
    }));
  }
}
