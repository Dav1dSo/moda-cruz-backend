import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DeleteCategoryUseCase } from './delete-category.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase;
  let categoryRepository: jest.Mocked<
    Pick<CategoryRepository, 'delete' | 'countProducts'>
  >;

  beforeEach(() => {
    categoryRepository = {
      delete: jest.fn(),
      countProducts: jest.fn(),
    };

    useCase = new DeleteCategoryUseCase(
      categoryRepository as unknown as CategoryRepository,
    );
  });

  it('remove a categoria quando não há produtos vinculados', async () => {
    categoryRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute(1);

    expect(categoryRepository.delete).toHaveBeenCalledWith(1);
    expect(categoryRepository.countProducts).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Categoria removida com sucesso' });
  });

  it('lança NotFoundException quando a categoria não existe', async () => {
    categoryRepository.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '6.19.3',
      }),
    );

    let caughtError: unknown;
    try {
      await useCase.execute(999);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(NotFoundException);
    expect((caughtError as NotFoundException).message).toBe(
      'Categoria não encontrada',
    );
  });

  it('lança BadRequestException com a contagem exata de produtos quando o banco rejeita o delete por FK', async () => {
    categoryRepository.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '6.19.3',
        },
      ),
    );
    categoryRepository.countProducts.mockResolvedValue(5);

    let caughtError: unknown;
    try {
      await useCase.execute(2);
    } catch (error) {
      caughtError = error;
    }

    expect(categoryRepository.countProducts).toHaveBeenCalledWith(2);
    expect(caughtError).toBeInstanceOf(BadRequestException);
    expect((caughtError as BadRequestException).message).toBe(
      'Não é possível remover: categoria vinculada a 5 produto(s).',
    );
  });

  it('propaga erros inesperados do repositório sem convertê-los', async () => {
    const genericError = new Error('Falha de conexão com o banco');
    categoryRepository.delete.mockRejectedValue(genericError);

    await expect(useCase.execute(4)).rejects.toThrow(genericError);
  });
});
