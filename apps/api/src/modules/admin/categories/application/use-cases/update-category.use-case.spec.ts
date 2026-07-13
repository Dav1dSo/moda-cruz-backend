import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateCategoryUseCase } from './update-category.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { UpdateCategoryRequestDTO } from '../../dtos/request/category-request';

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase;
  let categoryRepository: jest.Mocked<
    Pick<CategoryRepository, 'findById' | 'updateCategory'>
  >;

  const existingCategory = {
    id: 1,
    name: 'Calçados',
    slug: 'calcados',
    description: 'Categoria de calçados',
    image_url: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
  };

  const validRequest: UpdateCategoryRequestDTO = {
    name: 'Calçados Femininos',
    description: 'Categoria atualizada',
    image_url: 'https://cdn.example.com/calcados-femininos.png',
    sort_order: 2,
    is_active: false,
  };

  beforeEach(() => {
    categoryRepository = {
      findById: jest.fn(),
      updateCategory: jest.fn(),
    };

    useCase = new UpdateCategoryUseCase(
      categoryRepository as unknown as CategoryRepository,
    );
  });

  it('lança NotFoundException e não escreve quando a categoria não existe', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    let caughtError: unknown;
    try {
      await useCase.execute(validRequest, 999);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(NotFoundException);
    expect((caughtError as NotFoundException).message).toBe(
      'Categoria não encontrada',
    );
    expect(categoryRepository.updateCategory).not.toHaveBeenCalled();
  });

  it('atualiza os dados sem tocar no slug, mesmo quando o nome muda', async () => {
    categoryRepository.findById.mockResolvedValue(existingCategory);
    categoryRepository.updateCategory.mockResolvedValue(undefined);

    const result = await useCase.execute(validRequest, existingCategory.id);

    expect(categoryRepository.updateCategory).toHaveBeenCalledWith(
      existingCategory.id,
      validRequest,
    );
    expect(categoryRepository.updateCategory).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ message: 'Categoria atualizada com sucesso' });
  });

  it('trata P2025 (conflito de concorrência: categoria removida entre a leitura e a escrita) como não encontrada', async () => {
    categoryRepository.findById.mockResolvedValue(existingCategory);
    categoryRepository.updateCategory.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '6.19.3',
      }),
    );

    let caughtError: unknown;
    try {
      await useCase.execute(validRequest, existingCategory.id);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(NotFoundException);
    expect((caughtError as NotFoundException).message).toBe(
      'Categoria não encontrada',
    );
  });

  it('propaga erros que não são P2025 sem convertê-los em NotFoundException', async () => {
    categoryRepository.findById.mockResolvedValue(existingCategory);
    const genericError = new Error('Falha de conexão com o banco');
    categoryRepository.updateCategory.mockRejectedValue(genericError);

    await expect(
      useCase.execute(validRequest, existingCategory.id),
    ).rejects.toThrow(genericError);
  });
});
