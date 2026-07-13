import { ProductStatus } from '@prisma/client';
import { GetAllProductsUseCase } from './get-all-products.use-case';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { GetAllProductsFiltersDTO } from '../../dtos/request/product-request';
import { ProductListRow } from '../../infrastructure/repositories/product-list-row';

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
  let productRepository: jest.Mocked<Pick<ProductRepository, 'findAll'>>;

  const filters: GetAllProductsFiltersDTO = {
    page: 2,
    per_page: 20,
    search: 'camiseta',
    category_id: 3,
    status: ProductStatus.PUBLICADO,
    price_min: 10,
    price_max: 200,
    stock_min: 1,
    order_by: 'price',
    order_direction: 'asc',
  };

  const createdAt = new Date('2026-03-01T10:00:00.000Z');

  beforeEach(() => {
    productRepository = {
      findAll: jest.fn(),
    };

    useCase = new GetAllProductsUseCase(
      productRepository as unknown as ProductRepository,
    );
  });

  it('repassa os filtros recebidos exatamente para o repositório', async () => {
    productRepository.findAll.mockResolvedValue([]);

    await useCase.execute(filters);

    expect(productRepository.findAll).toHaveBeenCalledWith(filters);
  });

  it('mapeia cada linha retornada pelo repositório para o DTO de resposta', async () => {
    const rows: ProductListRow[] = [
      {
        id: 1,
        name: 'Camiseta Azul',
        slug: 'camiseta-azul',
        category_id: 3,
        category_name: 'Camisetas',
        price: '199.90',
        status: 'PUBLICADO',
        rating: 4.2,
        review_count: 8,
        created_at: createdAt,
        stock_total: 15,
        main_image_url: 'https://cdn.example.com/azul.png',
      },
      {
        id: 2,
        name: 'Camiseta Verde',
        slug: 'camiseta-verde',
        category_id: 3,
        category_name: 'Camisetas',
        price: '89.00',
        status: 'RASCUNHO',
        rating: 0,
        review_count: 0,
        created_at: createdAt,
        stock_total: 0,
        main_image_url: null,
      },
    ];

    productRepository.findAll.mockResolvedValue(rows);

    const result = await useCase.execute(filters);

    expect(result).toEqual([
      {
        id: 1,
        name: 'Camiseta Azul',
        slug: 'camiseta-azul',
        category: { id: 3, name: 'Camisetas' },
        price: 199.9,
        status: ProductStatus.PUBLICADO,
        stock_total: 15,
        main_image_url: 'https://cdn.example.com/azul.png',
        rating: 4.2,
        review_count: 8,
        created_at: '2026-03-01T10:00:00.000Z',
      },
      {
        id: 2,
        name: 'Camiseta Verde',
        slug: 'camiseta-verde',
        category: { id: 3, name: 'Camisetas' },
        price: 89,
        status: ProductStatus.RASCUNHO,
        stock_total: 0,
        main_image_url: null,
        rating: 0,
        review_count: 0,
        created_at: '2026-03-01T10:00:00.000Z',
      },
    ]);
  });

  it('retorna lista vazia quando o repositório não encontra produtos', async () => {
    productRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute(filters);

    expect(result).toEqual([]);
  });
});
