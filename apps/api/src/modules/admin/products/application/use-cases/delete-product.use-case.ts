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
import { ProductRepository } from '../../infrastructure/repositories/product.repository';

@Injectable()
export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    try {
      await this.productRepository.delete(id);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Produto não encontrado');
      }

      if (isPrismaForeignKeyConstraintError(error)) {
        const dependentsCount =
          await this.productRepository.countDependents(id);

        throw new BadRequestException(
          `Não é possível remover: produto vinculado a ${dependentsCount} registro(s) histórico(s). Arquive o produto (status ARQUIVADO) em vez de excluí-lo.`,
        );
      }

      throw error;
    }

    return { message: 'Produto removido com sucesso' };
  }
}
