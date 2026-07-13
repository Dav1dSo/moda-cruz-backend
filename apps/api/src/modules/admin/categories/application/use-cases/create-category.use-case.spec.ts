import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateCategoryUseCase } from './create-category.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { CreateCategoryRequestDTO } from '../../dtos/request/category-request';

function buildUniqueConstraintError() {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '6.19.3',
  });
}

describe('CreateCategoryUseCase', () => {
  let useCase: CreateCategoryUseCase;
  let categoryRepository: jest.Mocked<
    Pick<CategoryRepository, 'findBySlug' | 'createCategory'>
  >;

  const validRequest: CreateCategoryRequestDTO = {
    name: 'Calçados',
    description: 'Categoria de calçados',
    image_url: 'https://cdn.example.com/calcados.png',
    sort_order: 1,
    is_active: true,
  };

  beforeEach(() => {
    categoryRepository = {
      findBySlug: jest.fn(),
      createCategory: jest.fn(),
    };

    useCase = new CreateCategoryUseCase(
      categoryRepository as unknown as CategoryRepository,
    );
  });

  it('gera o slug a partir do nome (removendo acento e normalizando) e cria a categoria quando não há colisão', async () => {
    categoryRepository.findBySlug.mockResolvedValue(null);
    categoryRepository.createCategory.mockResolvedValue({ id: 1 } as never);

    const result = await useCase.execute(validRequest);

    expect(categoryRepository.findBySlug).toHaveBeenCalledWith('calcados');
    expect(categoryRepository.createCategory).toHaveBeenCalledWith(
      validRequest,
      'calcados',
    );
    expect(result).toEqual({ message: 'Categoria criada com sucesso' });
  });

  it('desambigua o slug com sufixo numérico incremental quando já existe colisão no banco', async () => {
    categoryRepository.findBySlug
      .mockResolvedValueOnce({ id: 10 })
      .mockResolvedValueOnce({ id: 11 })
      .mockResolvedValueOnce(null);
    categoryRepository.createCategory.mockResolvedValue({ id: 2 } as never);

    await useCase.execute(validRequest);

    expect(categoryRepository.findBySlug).toHaveBeenNthCalledWith(
      1,
      'calcados',
    );
    expect(categoryRepository.findBySlug).toHaveBeenNthCalledWith(
      2,
      'calcados-2',
    );
    expect(categoryRepository.findBySlug).toHaveBeenNthCalledWith(
      3,
      'calcados-3',
    );
    expect(categoryRepository.createCategory).toHaveBeenCalledWith(
      validRequest,
      'calcados-3',
    );
  });

  it('trunca a base do slug para respeitar o tamanho máximo da coluna', async () => {
    const longNameRequest: CreateCategoryRequestDTO = {
      ...validRequest,
      name: 'a'.repeat(200),
    };
    categoryRepository.findBySlug.mockResolvedValue(null);
    categoryRepository.createCategory.mockResolvedValue({ id: 3 } as never);

    await useCase.execute(longNameRequest);

    const [, slugUsed] = categoryRepository.createCategory.mock.calls[0];
    expect(slugUsed).toHaveLength(140);
    expect(slugUsed).toBe('a'.repeat(140));
  });

  it('propaga imediatamente um erro que não é de conflito de unicidade, sem tentar novamente', async () => {
    categoryRepository.findBySlug.mockResolvedValue(null);
    const genericError = new Error('Falha de conexão com o banco');
    categoryRepository.createCategory.mockRejectedValue(genericError);

    await expect(useCase.execute(validRequest)).rejects.toThrow(genericError);

    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(1);
  });

  it('tenta novamente após um conflito de escrita residual (P2002) e cria com sucesso na tentativa seguinte', async () => {
    categoryRepository.findBySlug.mockResolvedValue(null);
    categoryRepository.createCategory
      .mockRejectedValueOnce(buildUniqueConstraintError())
      .mockResolvedValueOnce({ id: 4 } as never);

    const result = await useCase.execute(validRequest);

    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ message: 'Categoria criada com sucesso' });
  });

  it('lança ConflictException após esgotar as tentativas quando toda escrita retorna conflito de unicidade (P2002)', async () => {
    categoryRepository.findBySlug.mockResolvedValue(null);
    categoryRepository.createCategory.mockRejectedValue(
      buildUniqueConstraintError(),
    );

    let caughtError: unknown;
    try {
      await useCase.execute(validRequest);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeInstanceOf(ConflictException);
    expect((caughtError as ConflictException).message).toBe(
      'Slug já cadastrado.',
    );
    expect(categoryRepository.createCategory).toHaveBeenCalledTimes(3);
  });
});
