import { FindCategoryUseCase } from './find-category.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';

describe('FindCategoryUseCase', () => {
  let useCase: FindCategoryUseCase;
  let categoryRepository: jest.Mocked<Pick<CategoryRepository, 'findById'>>;

  beforeEach(() => {
    categoryRepository = {
      findById: jest.fn(),
    };

    useCase = new FindCategoryUseCase(
      categoryRepository as unknown as CategoryRepository,
    );
  });

  it('retorna null quando a categoria não existe', async () => {
    categoryRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute(999);

    expect(categoryRepository.findById).toHaveBeenCalledWith(999);
    expect(result).toBeNull();
  });

  it('mapeia a categoria encontrada para o DTO de resposta, convertendo datas para ISO string', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 1,
      name: 'Calçados',
      slug: 'calcados',
      description: 'Categoria de calçados',
      image_url: 'https://cdn.example.com/calcados.png',
      sort_order: 3,
      is_active: true,
      created_at: new Date('2026-01-01T10:00:00.000Z'),
      updated_at: new Date('2026-02-01T10:00:00.000Z'),
    });

    const result = await useCase.execute(1);

    expect(result).toStrictEqual({
      id: 1,
      name: 'Calçados',
      slug: 'calcados',
      description: 'Categoria de calçados',
      image_url: 'https://cdn.example.com/calcados.png',
      sort_order: 3,
      is_active: true,
      created_at: '2026-01-01T10:00:00.000Z',
      updated_at: '2026-02-01T10:00:00.000Z',
    });
  });

  it('mapeia description e image_url nulos explicitamente como null (não undefined)', async () => {
    categoryRepository.findById.mockResolvedValue({
      id: 2,
      name: 'Roupas',
      slug: 'roupas',
      description: null,
      image_url: null,
      sort_order: 0,
      is_active: true,
      created_at: new Date('2026-01-01T10:00:00.000Z'),
      updated_at: new Date('2026-01-01T10:00:00.000Z'),
    });

    const result = await useCase.execute(2);

    expect(result?.description).toBeNull();
    expect(result?.image_url).toBeNull();
  });
});
