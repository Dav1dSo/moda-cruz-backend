import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { CreateProductUseCase } from './create-product.use-case';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { CreateProductRequestDTO } from '../../dtos/request/product-request';

function prismaError(
  code: string,
  meta?: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('erro prisma', {
    code,
    clientVersion: '6.19.3',
    meta,
  });
}

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<
    Pick<
      ProductRepository,
      'categoryExists' | 'findExistingSkus' | 'findBySlug' | 'createProduct'
    >
  >;

  const updatedBy = 42;

  const validRequest: CreateProductRequestDTO = {
    name: 'Camiseta Básica',
    category_id: 1,
    price: 99.9,
    colors: [{ name: 'Azul', hex: '#0000FF' }],
    variants: [{ color_name: 'Azul', size: 'M', sku: 'CAM-AZ-M', stock: 10 }],
  };

  beforeEach(() => {
    productRepository = {
      categoryExists: jest.fn(),
      findExistingSkus: jest.fn(),
      findBySlug: jest.fn(),
      createProduct: jest.fn(),
    };

    useCase = new CreateProductUseCase(
      productRepository as unknown as ProductRepository,
    );

    productRepository.categoryExists.mockResolvedValue(true);
    productRepository.findExistingSkus.mockResolvedValue([]);
    productRepository.findBySlug.mockResolvedValue(null);
    productRepository.createProduct.mockResolvedValue(undefined);
  });

  it('cria o produto com o slug gerado a partir do nome quando tudo é válido', async () => {
    const result = await useCase.execute(validRequest, updatedBy);

    expect(productRepository.findBySlug).toHaveBeenCalledWith(
      'camiseta-basica',
    );
    expect(productRepository.createProduct).toHaveBeenCalledWith(
      validRequest,
      updatedBy,
      'camiseta-basica',
    );
    expect(result).toEqual({ message: 'Produto criado com sucesso' });
  });

  it('lança NotFoundException e não valida nada mais quando a categoria não existe', async () => {
    productRepository.categoryExists.mockResolvedValue(false);

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new NotFoundException('Categoria não encontrada'),
    );

    expect(productRepository.findExistingSkus).not.toHaveBeenCalled();
    expect(productRepository.findBySlug).not.toHaveBeenCalled();
    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando há cores duplicadas no payload', async () => {
    const req: CreateProductRequestDTO = {
      ...validRequest,
      colors: [
        { name: 'Azul', hex: '#0000FF' },
        { name: 'azul', hex: '#0000AA' },
      ],
    };

    await expect(useCase.execute(req, updatedBy)).rejects.toThrow(
      BadRequestException,
    );

    expect(productRepository.findExistingSkus).not.toHaveBeenCalled();
    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando há SKU duplicado no payload', async () => {
    const req: CreateProductRequestDTO = {
      ...validRequest,
      colors: [
        { name: 'Azul', hex: '#0000FF' },
        { name: 'Vermelho', hex: '#FF0000' },
      ],
      variants: [
        { color_name: 'Azul', size: 'M', sku: 'CAM-AZ-M', stock: 10 },
        { color_name: 'Vermelho', size: 'G', sku: 'cam-az-m', stock: 5 },
      ],
    };

    await expect(useCase.execute(req, updatedBy)).rejects.toThrow(
      new BadRequestException('Existem SKUs repetidos no mesmo produto.'),
    );

    expect(productRepository.findExistingSkus).not.toHaveBeenCalled();
    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando a combinação cor+tamanho se repete', async () => {
    const req: CreateProductRequestDTO = {
      ...validRequest,
      colors: [{ name: 'Azul', hex: '#0000FF' }],
      variants: [
        { color_name: 'Azul', size: 'M', sku: 'CAM-AZ-M', stock: 10 },
        { color_name: 'Azul', size: 'M', sku: 'CAM-AZ-M-2', stock: 5 },
      ],
    };

    await expect(useCase.execute(req, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Existem variações repetidas com a mesma cor e tamanho.',
      ),
    );

    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando a variante referencia cor que não está em colors', async () => {
    const req: CreateProductRequestDTO = {
      ...validRequest,
      colors: [{ name: 'Azul', hex: '#0000FF' }],
      variants: [
        { color_name: 'Verde', size: 'M', sku: 'CAM-VD-M', stock: 10 },
      ],
    };

    await expect(useCase.execute(req, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'A cor "Verde" informada em uma variação não corresponde a nenhuma cor do produto.',
      ),
    );

    expect(productRepository.findExistingSkus).not.toHaveBeenCalled();
    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('lança ConflictException e não cria o produto quando o SKU já existe no banco', async () => {
    productRepository.findExistingSkus.mockResolvedValue(['cam-az-m']);

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new ConflictException('SKU(s) já cadastrado(s): cam-az-m'),
    );

    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando o produto é PUBLICADO sem nenhuma variante com estoque', async () => {
    const req: CreateProductRequestDTO = {
      ...validRequest,
      status: ProductStatus.PUBLICADO,
      variants: [{ color_name: 'Azul', size: 'M', sku: 'CAM-AZ-M', stock: 0 }],
    };

    await expect(useCase.execute(req, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
      ),
    );

    expect(productRepository.findExistingSkus).not.toHaveBeenCalled();
    expect(productRepository.createProduct).not.toHaveBeenCalled();
  });

  it('cria normalmente um produto PUBLICADO quando ao menos uma variante tem estoque', async () => {
    const req: CreateProductRequestDTO = {
      ...validRequest,
      status: ProductStatus.PUBLICADO,
      variants: [{ color_name: 'Azul', size: 'M', sku: 'CAM-AZ-M', stock: 3 }],
    };

    const result = await useCase.execute(req, updatedBy);

    expect(productRepository.createProduct).toHaveBeenCalledWith(
      req,
      updatedBy,
      'camiseta-basica',
    );
    expect(result).toEqual({ message: 'Produto criado com sucesso' });
  });

  it('tenta o slug com sufixo -2 quando o slug base já existe no banco', async () => {
    productRepository.findBySlug
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce(null);

    const result = await useCase.execute(validRequest, updatedBy);

    expect(productRepository.findBySlug).toHaveBeenNthCalledWith(
      1,
      'camiseta-basica',
    );
    expect(productRepository.findBySlug).toHaveBeenNthCalledWith(
      2,
      'camiseta-basica-2',
    );
    expect(productRepository.createProduct).toHaveBeenCalledWith(
      validRequest,
      updatedBy,
      'camiseta-basica-2',
    );
    expect(result).toEqual({ message: 'Produto criado com sucesso' });
  });

  it('lança ConflictException quando as 3 tentativas de criação colidem por slug', async () => {
    productRepository.findBySlug.mockResolvedValue(null);
    productRepository.createProduct.mockRejectedValue(
      prismaError('P2002', { target: ['slug'] }),
    );

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new ConflictException('Slug já cadastrado.'),
    );

    expect(productRepository.createProduct).toHaveBeenCalledTimes(3);
  });

  it('lança ConflictException com a mensagem de SKU quando o conflito de escrita (P2002) não é de slug', async () => {
    productRepository.createProduct.mockRejectedValue(
      prismaError('P2002', { target: ['sku'] }),
    );

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new ConflictException('SKU já cadastrado.'),
    );

    expect(productRepository.createProduct).toHaveBeenCalledTimes(1);
  });

  it('lança NotFoundException quando a escrita falha por violação de chave estrangeira (P2003)', async () => {
    productRepository.createProduct.mockRejectedValue(prismaError('P2003'));

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new NotFoundException('Categoria não encontrada'),
    );
  });

  it('lança ConflictException quando a escrita falha por conflito de transação (P2034)', async () => {
    productRepository.createProduct.mockRejectedValue(prismaError('P2034'));

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new ConflictException('Conflito ao criar o produto, tente novamente.'),
    );
  });

  it('lança BadRequestException quando o trigger de banco rejeita a escrita por falta de estoque', async () => {
    productRepository.createProduct.mockRejectedValue(
      new Prisma.PrismaClientUnknownRequestError(
        'PRODUCT_INSUFFICIENT_STOCK: produto 1 está com status PUBLICADO mas não possui nenhuma variação com estoque disponível',
        { clientVersion: '6.19.3' },
      ),
    );

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
      ),
    );
  });

  it('propaga erros desconhecidos sem convertê-los em exception HTTP', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    productRepository.createProduct.mockRejectedValue(unknownError);

    await expect(useCase.execute(validRequest, updatedBy)).rejects.toThrow(
      unknownError,
    );
  });
});
