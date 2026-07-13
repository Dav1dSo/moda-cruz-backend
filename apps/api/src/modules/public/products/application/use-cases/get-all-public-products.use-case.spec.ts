import { GetAllPublicProductsUseCase } from './get-all-public-products.use-case';
import { PublicProductRepository } from '../../infrastructure/repositories/public-product.repository';
import { GetAllPublicProductsFiltersDTO } from '../../dtos/request/public-product-request';
import { PublicProductListRow } from '../../infrastructure/repositories/public-product-list-row';

describe('GetAllPublicProductsUseCase', () => {
  let useCase: GetAllPublicProductsUseCase;
  let publicProductRepository: jest.Mocked<
    Pick<PublicProductRepository, 'findAll' | 'count'>
  >;

  const filters: GetAllPublicProductsFiltersDTO = {
    page: 1,
    per_page: 10,
    sort: 'relevance',
    search: 'camisa',
    category_id: 3,
  };

  const row: PublicProductListRow = {
    id: 10,
    name: 'Camisa Social Branca',
    slug: 'camisa-social-branca',
    category_id: 3,
    category_name: 'Camisas',
    category_slug: 'camisas',
    price: '199.90',
    rating: 4.5,
    review_count: 12,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    stock_total: 8,
    main_image_url: 'https://cdn.example.com/camisa.jpg',
  };

  beforeEach(() => {
    publicProductRepository = {
      findAll: jest.fn(),
      count: jest.fn(),
    };

    useCase = new GetAllPublicProductsUseCase(
      publicProductRepository as unknown as PublicProductRepository,
    );
  });

  it('repassa os filtros recebidos para findAll e count do repositório', async () => {
    publicProductRepository.findAll.mockResolvedValue([]);
    publicProductRepository.count.mockResolvedValue(0);

    await useCase.execute(filters);

    expect(publicProductRepository.findAll).toHaveBeenCalledWith(filters);
    expect(publicProductRepository.count).toHaveBeenCalledWith(filters);
  });

  it('mapeia cada PublicProductListRow para o shape de PublicProductListItemDTO', async () => {
    publicProductRepository.findAll.mockResolvedValue([row]);
    publicProductRepository.count.mockResolvedValue(1);

    const result = await useCase.execute(filters);

    expect(result.data).toEqual([
      {
        id: 10,
        slug: 'camisa-social-branca',
        name: 'Camisa Social Branca',
        category: {
          id: 3,
          name: 'Camisas',
          slug: 'camisas',
        },
        price: 199.9,
        rating: 4.5,
        review_count: 12,
        main_image_url: 'https://cdn.example.com/camisa.jpg',
        stock_total: 8,
      },
    ]);
  });

  it('converte o preço de string para number ao mapear', async () => {
    publicProductRepository.findAll.mockResolvedValue([
      { ...row, price: '1234.56' },
    ]);
    publicProductRepository.count.mockResolvedValue(1);

    const result = await useCase.execute(filters);

    expect(result.data[0].price).toBe(1234.56);
    expect(typeof result.data[0].price).toBe('number');
  });

  it('mantém main_image_url como null quando o produto não tem imagem', async () => {
    publicProductRepository.findAll.mockResolvedValue([
      { ...row, main_image_url: null },
    ]);
    publicProductRepository.count.mockResolvedValue(1);

    const result = await useCase.execute(filters);

    expect(result.data[0].main_image_url).toBeNull();
  });

  it('calcula total_pages arredondando para cima a partir de total e per_page', async () => {
    publicProductRepository.findAll.mockResolvedValue([]);
    publicProductRepository.count.mockResolvedValue(15);

    const result = await useCase.execute({ ...filters, per_page: 10 });

    expect(result.pagination).toEqual({
      page: 1,
      per_page: 10,
      total: 15,
      total_pages: 2,
    });
  });

  it('retorna total_pages igual a zero quando não há nenhum produto', async () => {
    publicProductRepository.findAll.mockResolvedValue([]);
    publicProductRepository.count.mockResolvedValue(0);

    const result = await useCase.execute(filters);

    expect(result.pagination).toEqual({
      page: 1,
      per_page: 10,
      total: 0,
      total_pages: 0,
    });
  });

  it('reflete page e per_page dos filtros recebidos na paginação de resposta, mesmo quando total é exatamente divisível', async () => {
    publicProductRepository.findAll.mockResolvedValue([]);
    publicProductRepository.count.mockResolvedValue(20);

    const result = await useCase.execute({ ...filters, page: 2, per_page: 5 });

    expect(result.pagination).toEqual({
      page: 2,
      per_page: 5,
      total: 20,
      total_pages: 4,
    });
  });
});
