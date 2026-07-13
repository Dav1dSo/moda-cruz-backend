import { Module } from '@nestjs/common';
import { PublicCategoriesController } from './categories.controller';
import { GetAllPublicCategoriesUseCase } from './application/use-cases/get-all-public-categories.use-case';
import { PublicCategoryRepository } from './infrastructure/repositories/public-category.repository';

@Module({
  controllers: [PublicCategoriesController],
  providers: [GetAllPublicCategoriesUseCase, PublicCategoryRepository],
})
export class PublicCategoriesModule {}
