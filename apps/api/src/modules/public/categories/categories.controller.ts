import { Controller, Get, Query } from '@nestjs/common';
import { GetAllPublicCategoriesUseCase } from './application/use-cases/get-all-public-categories.use-case';
import { GetAllPublicCategoriesFiltersDTO } from './dtos/request/public-category-request';
import { GetAllPublicCategoriesResponseDTO } from './dtos/response/public-category-response';

@Controller('catalog/categories')
export class PublicCategoriesController {
  constructor(
    private readonly getAllPublicCategoriesUseCase: GetAllPublicCategoriesUseCase,
  ) {}

  @Get()
  async findAll(
    @Query() filters: GetAllPublicCategoriesFiltersDTO,
  ): Promise<GetAllPublicCategoriesResponseDTO[]> {
    return await this.getAllPublicCategoriesUseCase.execute(filters);
  }
}
