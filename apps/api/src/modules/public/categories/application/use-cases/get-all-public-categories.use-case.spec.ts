import { GetAllPublicCategoriesUseCase } from './get-all-public-categories.use-case';
import { PublicCategoryRepository } from '../../infrastructure/repositories/public-category.repository';
import { GetAllPublicCategoriesFiltersDTO } from '../../dtos/request/public-category-request';

describe('GetAllPublicCategoriesUseCase', () => {
  let useCase: GetAllPublicCategoriesUseCase;
  let publicCategoryRepository: jest.Mocked<
    Pick<PublicCategoryRepository, 'findAll'>
  >;

  const filters: GetAllPublicCategoriesFiltersDTO = {
    search: 'camisa',
  };

  const category = {
    id: 1,
    name: 'Camisas',
    slug: 'camisas',
    image_url: 'https://cdn.example.com/camisas.jpg',
  };

  beforeEach(() => {
    publicCategoryRepository = {
      findAll: jest.fn(),
    };

    useCase = new GetAllPublicCategoriesUseCase(
      publicCategoryRepository as unknown as PublicCategoryRepository,
    );
  });

  it('repassa o filtro search recebido para findAll do repositório', async () => {
    publicCategoryRepository.findAll.mockResolvedValue([]);

    await useCase.execute(filters);

    expect(publicCategoryRepository.findAll).toHaveBeenCalledWith(filters);
  });

  it('repassa filtros sem search (undefined) exatamente como recebidos para findAll', async () => {
    publicCategoryRepository.findAll.mockResolvedValue([]);

    await useCase.execute({});

    expect(publicCategoryRepository.findAll).toHaveBeenCalledWith({});
  });

  it('mapeia cada categoria retornada pelo repositório para o shape de GetAllPublicCategoriesResponseDTO', async () => {
    publicCategoryRepository.findAll.mockResolvedValue([category]);

    const result = await useCase.execute(filters);

    expect(result).toEqual([
      {
        id: 1,
        name: 'Camisas',
        slug: 'camisas',
        image_url: 'https://cdn.example.com/camisas.jpg',
      },
    ]);
  });

  it('mantém image_url como null explícito quando a categoria não tem imagem', async () => {
    publicCategoryRepository.findAll.mockResolvedValue([
      { ...category, image_url: null },
    ]);

    const result = await useCase.execute(filters);

    expect(result[0].image_url).toBeNull();
  });

  it('mapeia múltiplas categorias preservando id, name e slug de cada uma', async () => {
    const secondCategory = {
      id: 2,
      name: 'Calças',
      slug: 'calcas',
      image_url: null,
    };
    publicCategoryRepository.findAll.mockResolvedValue([
      category,
      secondCategory,
    ]);

    const result = await useCase.execute(filters);

    expect(result).toEqual([
      {
        id: 1,
        name: 'Camisas',
        slug: 'camisas',
        image_url: 'https://cdn.example.com/camisas.jpg',
      },
      {
        id: 2,
        name: 'Calças',
        slug: 'calcas',
        image_url: null,
      },
    ]);
  });

  it('retorna lista vazia quando o repositório não encontra nenhuma categoria', async () => {
    publicCategoryRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(filters);

    expect(result).toEqual([]);
  });
});
