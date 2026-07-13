import { NotFoundException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { FindProductUseCase } from './find-product.use-case';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';

function decimal(value: number) {
  return { toNumber: () => value };
}

describe('FindProductUseCase', () => {
  let useCase: FindProductUseCase;
  let productRepository: jest.Mocked<Pick<ProductRepository, 'findById'>>;

  const productId = 5;
  const createdAt = new Date('2026-01-10T12:00:00.000Z');
  const updatedAt = new Date('2026-02-15T08:30:00.000Z');

  const fullProduct = {
    id: productId,
    name: 'Camiseta Básica',
    slug: 'camiseta-basica',
    description: 'Camiseta de algodão',
    price: decimal(99.9),
    status: ProductStatus.PUBLICADO,
    rating: 4.5,
    review_count: 12,
    created_at: createdAt,
    updated_at: updatedAt,
    updated_by: 42,
    category: { id: 1, name: 'Camisetas' },
    colors: [{ id: 1, name: 'Azul', hex: '#0000FF' }],
    images: [{ id: 1, url: 'https://cdn.example.com/img.png', alt: null }],
    variants: [
      {
        id: 1,
        size: 'M',
        sku: 'cam-az-m',
        price: decimal(89.9),
        stock: 5,
        color: { id: 1, name: 'Azul', hex: '#0000FF' },
      },
      {
        id: 2,
        size: 'G',
        sku: 'cam-az-g',
        price: null,
        stock: 3,
        color: { id: 1, name: 'Azul', hex: '#0000FF' },
      },
    ],
  };

  beforeEach(() => {
    productRepository = {
      findById: jest.fn(),
    };

    useCase = new FindProductUseCase(
      productRepository as unknown as ProductRepository,
    );
  });

  it('lança NotFoundException quando o produto não existe', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(productId)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('mapeia todos os campos do produto, calcula o estoque total e formata as datas em ISO', async () => {
    productRepository.findById.mockResolvedValue(fullProduct as never);

    const result = await useCase.execute(productId);

    expect(result).toEqual({
      id: productId,
      name: 'Camiseta Básica',
      slug: 'camiseta-basica',
      description: 'Camiseta de algodão',
      category: { id: 1, name: 'Camisetas' },
      price: 99.9,
      status: ProductStatus.PUBLICADO,
      rating: 4.5,
      review_count: 12,
      stock_total: 8,
      colors: [{ id: 1, name: 'Azul', hex: '#0000FF' }],
      images: [{ id: 1, url: 'https://cdn.example.com/img.png', alt: null }],
      variants: [
        {
          id: 1,
          color: { id: 1, name: 'Azul', hex: '#0000FF' },
          size: 'M',
          sku: 'cam-az-m',
          price: 89.9,
          stock: 5,
        },
        {
          id: 2,
          color: { id: 1, name: 'Azul', hex: '#0000FF' },
          size: 'G',
          sku: 'cam-az-g',
          price: null,
          stock: 3,
        },
      ],
      created_at: '2026-01-10T12:00:00.000Z',
      updated_at: '2026-02-15T08:30:00.000Z',
      updated_by: 42,
    });
  });

  it('mapeia description null explicitamente quando o produto não tem descrição', async () => {
    productRepository.findById.mockResolvedValue({
      ...fullProduct,
      description: null,
    } as never);

    const result = await useCase.execute(productId);

    expect(result?.description).toBeNull();
  });

  it('não inclui campos sensíveis fora do contrato de resposta (apenas os campos mapeados explicitamente)', async () => {
    productRepository.findById.mockResolvedValue(fullProduct as never);

    const result = await useCase.execute(productId);

    expect(Object.keys(result ?? {}).sort()).toEqual(
      [
        'id',
        'name',
        'slug',
        'description',
        'category',
        'price',
        'status',
        'rating',
        'review_count',
        'stock_total',
        'colors',
        'images',
        'variants',
        'created_at',
        'updated_at',
        'updated_by',
      ].sort(),
    );
  });
});
