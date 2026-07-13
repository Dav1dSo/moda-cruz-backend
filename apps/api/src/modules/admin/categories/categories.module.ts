import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case';
import { GetAllCategoriesUseCase } from './application/use-cases/get-all-categories.use-case';
import { FindCategoryUseCase } from './application/use-cases/find-category.use-case';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case';
import { CategoryRepository } from './infrastructure/repositories/category.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryUseCase,
    GetAllCategoriesUseCase,
    FindCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    CategoryRepository,
  ],
})
export class CategoriesModule {}
