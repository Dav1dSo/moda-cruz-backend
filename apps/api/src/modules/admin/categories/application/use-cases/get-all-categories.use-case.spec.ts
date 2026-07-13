import { GetAllCategoriesUseCase } from './get-all-categories.use-case';
import { CategoryRepository } from '../../infrastructure/repositories/category.repository';
import { GetAllCategoriesFiltersDTO } from '../../dtos/request/category-request';

describe('GetAllCategoriesUseCase', () => {
  let useCase: GetAllCategoriesUseCase;
  let categoryRepository: jest.Mocked<Pick<CategoryRepository, 'findAll'>>;

  const filters: GetAllCategoriesFiltersDTO = {
    page: 2,
    per_page: 10,
    name: 'calça',
    is_active: true,
    order_by: 'name',
    order_direction: 'desc',
  };

  beforeEach(() => {
    categoryRepository = {
      findAll: jest.fn(),
    };

    useCase = new GetAllCategoriesUseCase(
      categoryRepository as unknown as CategoryRepository,
    );
  });

  it('repassa os filtros recebidos integralmente para o repositório', async () => {
    categoryRepository.findAll.mockResolvedValue([]);

    await useCase.execute(filters);

    expect(categoryRepository.findAll).toHaveBeenCalledWith(filters);
    expect(categoryRepository.findAll).toHaveBeenCalledTimes(1);
  });

  it('retorna lista vazia quando o repositório não encontra categorias', async () => {
    categoryRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(filters);

    expect(result).toEqual([]);
  });

  it('mapeia cada categoria da lista para o DTO de resposta, com datas em ISO string e nulos explícitos', async () => {
    categoryRepository.findAll.mockResolvedValue([
      {
        id: 1,
        name: 'Calçados',
        slug: 'calcados',
        description: 'Categoria de calçados',
        image_url: 'https://cdn.example.com/calcados.png',
        sort_order: 1,
        is_active: true,
        created_at: new Date('2026-01-01T10:00:00.000Z'),
        updated_at: new Date('2026-01-02T10:00:00.000Z'),
      },
      {
        id: 2,
        name: 'Roupas',
        slug: 'roupas',
        description: null,
        image_url: null,
        sort_order: 2,
        is_active: false,
        created_at: new Date('2026-03-01T10:00:00.000Z'),
        updated_at: new Date('2026-03-02T10:00:00.000Z'),
      },
    ] as never);

    const result = await useCase.execute(filters);

    expect(result).toStrictEqual([
      {
        id: 1,
        name: 'Calçados',
        slug: 'calcados',
        description: 'Categoria de calçados',
        image_url: 'https://cdn.example.com/calcados.png',
        sort_order: 1,
        is_active: true,
        created_at: '2026-01-01T10:00:00.000Z',
        updated_at: '2026-01-02T10:00:00.000Z',
      },
      {
        id: 2,
        name: 'Roupas',
        slug: 'roupas',
        description: null,
        image_url: null,
        sort_order: 2,
        is_active: false,
        created_at: '2026-03-01T10:00:00.000Z',
        updated_at: '2026-03-02T10:00:00.000Z',
      },
    ]);
  });
});
