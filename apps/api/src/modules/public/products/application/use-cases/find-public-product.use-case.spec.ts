import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { FindPublicProductUseCase } from './find-public-product.use-case';
import { PublicProductRepository } from '../../infrastructure/repositories/public-product.repository';

describe('FindPublicProductUseCase', () => {
  let useCase: FindPublicProductUseCase;
  let publicProductRepository: jest.Mocked<
    Pick<PublicProductRepository, 'findBySlug'>
  >;

  const slug = 'terno-azul-marinho';

  const color = { id: 1, name: 'Azul', hex: '#0000FF' };

  const productWithSensitiveFields = {
    id: 5,
    name: 'Terno Azul Marinho',
    slug: 'terno-azul-marinho',
    description: 'Um terno elegante para ocasiões formais',
    price: new Prisma.Decimal('799.90'),
    rating: 4.8,
    review_count: 25,
    category: { id: 2, name: 'Ternos', slug: 'ternos' },
    colors: [color],
    images: [
      { id: 1, url: 'https://cdn.example.com/img1.jpg', alt: 'Foto 1' },
      { id: 2, url: 'https://cdn.example.com/img2.jpg', alt: null },
    ],
    variants: [
      {
        id: 1,
        size: 'P',
        price: new Prisma.Decimal('799.90'),
        stock: 3,
        color,
      },
      {
        id: 2,
        size: 'M',
        price: null,
        stock: 5,
        color,
      },
    ],
    sku: 'TERNO-AZUL-P',
    status: 'PUBLICADO',
    updated_by: 7,
  };

  beforeEach(() => {
    publicProductRepository = {
      findBySlug: jest.fn(),
    };

    useCase = new FindPublicProductUseCase(
      publicProductRepository as unknown as PublicProductRepository,
    );
  });

  it('retorna o produto mapeado, sem sku/status/updated_by, quando encontrado', async () => {
    publicProductRepository.findBySlug.mockResolvedValue(
      productWithSensitiveFields,
    );

    const result = await useCase.execute(slug);

    expect(result).toEqual({
      id: 5,
      slug: 'terno-azul-marinho',
      name: 'Terno Azul Marinho',
      description: 'Um terno elegante para ocasiões formais',
      category: { id: 2, name: 'Ternos', slug: 'ternos' },
      price: 799.9,
      rating: 4.8,
      review_count: 25,
      stock_total: 8,
      colors: [{ id: 1, name: 'Azul', hex: '#0000FF' }],
      images: [
        { id: 1, url: 'https://cdn.example.com/img1.jpg', alt: 'Foto 1' },
        { id: 2, url: 'https://cdn.example.com/img2.jpg', alt: null },
      ],
      variants: [
        {
          id: 1,
          color: { id: 1, name: 'Azul', hex: '#0000FF' },
          size: 'P',
          price: 799.9,
          stock: 3,
        },
        {
          id: 2,
          color: { id: 1, name: 'Azul', hex: '#0000FF' },
          size: 'M',
          price: null,
          stock: 5,
        },
      ],
    });
  });

  it('nunca expõe sku, status ou updated_by no objeto de resposta', async () => {
    publicProductRepository.findBySlug.mockResolvedValue(
      productWithSensitiveFields,
    );

    const result = await useCase.execute(slug);

    const resultKeys = Object.keys(result);

    expect(resultKeys).not.toContain('sku');
    expect(resultKeys).not.toContain('status');
    expect(resultKeys).not.toContain('updated_by');
  });

  it('soma o estoque de todas as variações em stock_total', async () => {
    publicProductRepository.findBySlug.mockResolvedValue({
      ...productWithSensitiveFields,
      variants: [
        { id: 1, size: 'P', price: null, stock: 2, color },
        { id: 2, size: 'M', price: null, stock: 0, color },
        { id: 3, size: 'G', price: null, stock: 10, color },
      ],
    });

    const result = await useCase.execute(slug);

    expect(result.stock_total).toBe(12);
  });

  it('retorna description como null explícito quando o produto não tem descrição', async () => {
    publicProductRepository.findBySlug.mockResolvedValue({
      ...productWithSensitiveFields,
      description: null,
    });

    const result = await useCase.execute(slug);

    expect(result.description).toBeNull();
  });

  it('retorna price da variação como null quando a variação não tem preço próprio', async () => {
    publicProductRepository.findBySlug.mockResolvedValue(
      productWithSensitiveFields,
    );

    const result = await useCase.execute(slug);

    expect(result.variants[1].price).toBeNull();
  });

  it('busca o produto pelo slug recebido', async () => {
    publicProductRepository.findBySlug.mockResolvedValue(
      productWithSensitiveFields,
    );

    await useCase.execute(slug);

    expect(publicProductRepository.findBySlug).toHaveBeenCalledWith(slug);
  });

  it('lança NotFoundException com mensagem genérica quando o produto não é encontrado', async () => {
    publicProductRepository.findBySlug.mockResolvedValue(null);

    await expect(useCase.execute(slug)).rejects.toThrow(
      new NotFoundException('Produto não encontrado'),
    );
  });

  it('lança a mesma NotFoundException genérica tanto para slug inexistente quanto para produto despublicado ou de categoria inativa, pois o repositório já filtra e o use case só recebe null', async () => {
    publicProductRepository.findBySlug.mockResolvedValueOnce(null);
    await expect(useCase.execute('slug-inexistente')).rejects.toThrow(
      'Produto não encontrado',
    );

    publicProductRepository.findBySlug.mockResolvedValueOnce(null);
    await expect(useCase.execute('slug-de-produto-rascunho')).rejects.toThrow(
      'Produto não encontrado',
    );
  });
});
