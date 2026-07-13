import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaNotFoundError } from '@shared/utils/prisma-errors';
import { UpdateCategoryRequestDTO } from '../../dtos/request/category-request';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    req: UpdateCategoryRequestDTO,
    id: number,
  ): Promise<ResponseDefaultDTO> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    try {
      await this.categoryRepository.updateCategory(id, req);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Categoria não encontrada');
      }

      throw error;
    }

    return { message: 'Categoria atualizada com sucesso' };
  }
}
