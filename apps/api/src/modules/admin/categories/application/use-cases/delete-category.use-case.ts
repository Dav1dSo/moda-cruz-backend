import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaNotFoundError,
} from '@shared/utils/prisma-errors';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    try {
      await this.categoryRepository.delete(id);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Categoria não encontrada');
      }

      if (isPrismaForeignKeyConstraintError(error)) {
        const dependentsCount = await this.categoryRepository.countProducts(id);

        throw new BadRequestException(
          `Não é possível remover: categoria vinculada a ${dependentsCount} produto(s).`,
        );
      }

      throw error;
    }

    return { message: 'Categoria removida com sucesso' };
  }
}
