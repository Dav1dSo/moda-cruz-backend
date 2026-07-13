import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProductStatus } from '@prisma/client';
import { UpdateProductUseCase } from './update-product.use-case';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';
import { UpdateProductRequestDTO } from '../../dtos/request/product-request';

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

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: jest.Mocked<
    Pick<
      ProductRepository,
      | 'findById'
      | 'categoryExists'
      | 'findConflictingVariantSkus'
      | 'findColorsByProduct'
      | 'findVariantIdsBelongingToProduct'
      | 'updateProductWithRelations'
    >
  >;

  const productId = 10;
  const updatedBy = 42;

  const validRequest: UpdateProductRequestDTO = {
    name: 'Camiseta Atualizada',
    category_id: 1,
    price: 129.9,
  };

  const existingRascunhoProduct = { status: ProductStatus.RASCUNHO } as never;
  const existingPublicadoProduct = { status: ProductStatus.PUBLICADO } as never;

  beforeEach(() => {
    productRepository = {
      findById: jest.fn(),
      categoryExists: jest.fn(),
      findConflictingVariantSkus: jest.fn(),
      findColorsByProduct: jest.fn(),
      findVariantIdsBelongingToProduct: jest.fn(),
      updateProductWithRelations: jest.fn(),
    };

    useCase = new UpdateProductUseCase(
      productRepository as unknown as ProductRepository,
    );

    productRepository.findById.mockResolvedValue(existingRascunhoProduct);
    productRepository.categoryExists.mockResolvedValue(true);
    productRepository.findConflictingVariantSkus.mockResolvedValue([]);
    productRepository.findColorsByProduct.mockResolvedValue([]);
    productRepository.findVariantIdsBelongingToProduct.mockResolvedValue([]);
    productRepository.updateProductWithRelations.mockResolvedValue(undefined);
  });

  it('atualiza o produto quando status/variants não são enviados', async () => {
    const result = await useCase.execute(validRequest, productId, updatedBy);

    expect(productRepository.updateProductWithRelations).toHaveBeenCalledWith(
      productId,
      validRequest,
      updatedBy,
      undefined,
    );
    expect(result).toEqual({ message: 'Produto atualizado com sucesso' });
  });

  it('lança NotFoundException e não segue a validação quando o produto não existe', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(new NotFoundException('Produto não encontrado'));

    expect(productRepository.categoryExists).not.toHaveBeenCalled();
    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança NotFoundException e não persiste quando a categoria não existe', async () => {
    productRepository.categoryExists.mockResolvedValue(false);

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(new NotFoundException('Categoria não encontrada'));

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando colors é enviado sem variants', async () => {
    const req: UpdateProductRequestDTO = {
      ...validRequest,
      colors: [{ name: 'Azul', hex: '#0000FF' }],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Ao atualizar as cores do produto, a lista de variações também deve ser enviada no mesmo request.',
      ),
    );

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando há cores duplicadas no payload', async () => {
    const req: UpdateProductRequestDTO = {
      ...validRequest,
      colors: [
        { name: 'Azul', hex: '#0000FF' },
        { name: 'azul', hex: '#0000AA' },
      ],
      variants: [{ color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 1 }],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      BadRequestException,
    );

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando há SKU duplicado nas variantes', async () => {
    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [
        { color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 1 },
        { color_name: 'Azul', size: 'G', sku: 'cam-m', stock: 1 },
      ],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException('Existem SKUs repetidos no mesmo produto.'),
    );

    expect(productRepository.findConflictingVariantSkus).not.toHaveBeenCalled();
    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando a combinação cor+tamanho se repete nas variantes', async () => {
    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [
        { color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 1 },
        { color_name: 'Azul', size: 'M', sku: 'CAM-M-2', stock: 1 },
      ],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Existem variações repetidas com a mesma cor e tamanho.',
      ),
    );

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException quando colors e variants são enviados juntos e a variante referencia cor ausente no payload', async () => {
    const req: UpdateProductRequestDTO = {
      ...validRequest,
      colors: [{ name: 'Azul', hex: '#0000FF' }],
      variants: [{ color_name: 'Verde', size: 'M', sku: 'CAM-M', stock: 1 }],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'A cor "Verde" informada em uma variação não corresponde a nenhuma cor do produto.',
      ),
    );

    expect(productRepository.findColorsByProduct).not.toHaveBeenCalled();
    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('resolve a cor da variante contra as cores já existentes do produto quando somente variants é enviado (sem colors)', async () => {
    productRepository.findColorsByProduct.mockResolvedValue([
      { id: 5, name: 'Verde' },
    ]);

    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [{ color_name: 'Verde', size: 'M', sku: 'CAM-M', stock: 1 }],
    };

    const result = await useCase.execute(req, productId, updatedBy);

    expect(productRepository.findColorsByProduct).toHaveBeenCalledWith(
      productId,
    );

    const call = productRepository.updateProductWithRelations.mock.calls[0];
    expect(call[0]).toBe(productId);
    expect(call[1]).toBe(req);
    expect(call[2]).toBe(updatedBy);
    expect(call[3]).toBeInstanceOf(Map);
    expect((call[3] as Map<string, number>).get('verde')).toBe(5);
    expect(result).toEqual({ message: 'Produto atualizado com sucesso' });
  });

  it('lança BadRequestException quando somente variants é enviado e a cor não corresponde a nenhuma cor existente do produto', async () => {
    productRepository.findColorsByProduct.mockResolvedValue([
      { id: 5, name: 'Azul' },
    ]);

    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [{ color_name: 'Verde', size: 'M', sku: 'CAM-M', stock: 1 }],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'A cor "Verde" informada em uma variação não corresponde a nenhuma cor do produto.',
      ),
    );

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException e não persiste quando uma variante informada com id não pertence ao produto', async () => {
    productRepository.findColorsByProduct.mockResolvedValue([
      { id: 5, name: 'Azul' },
    ]);
    productRepository.findVariantIdsBelongingToProduct.mockResolvedValue([]);

    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [
        { id: 99, color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 1 },
      ],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Uma ou mais variações informadas não pertencem a este produto.',
      ),
    );

    expect(
      productRepository.findVariantIdsBelongingToProduct,
    ).toHaveBeenCalledWith(productId, [99]);
    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('persiste normalmente quando a variante informada com id pertence ao produto', async () => {
    productRepository.findColorsByProduct.mockResolvedValue([
      { id: 5, name: 'Azul' },
    ]);
    productRepository.findVariantIdsBelongingToProduct.mockResolvedValue([99]);

    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [
        { id: 99, color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 1 },
      ],
    };

    const result = await useCase.execute(req, productId, updatedBy);

    expect(result).toEqual({ message: 'Produto atualizado com sucesso' });
    expect(productRepository.updateProductWithRelations).toHaveBeenCalled();
  });

  it('lança ConflictException e não persiste quando alguma variante colide com SKU já existente no banco', async () => {
    productRepository.findConflictingVariantSkus.mockResolvedValue(['cam-m']);
    productRepository.findColorsByProduct.mockResolvedValue([
      { id: 5, name: 'Azul' },
    ]);

    const req: UpdateProductRequestDTO = {
      ...validRequest,
      variants: [{ color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 1 }],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new ConflictException('SKU(s) já cadastrado(s): cam-m'),
    );

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('lança BadRequestException quando variantes são enviadas e o status resolvido é PUBLICADO sem estoque', async () => {
    productRepository.findColorsByProduct.mockResolvedValue([
      { id: 5, name: 'Azul' },
    ]);

    const req: UpdateProductRequestDTO = {
      ...validRequest,
      status: ProductStatus.PUBLICADO,
      variants: [{ color_name: 'Azul', size: 'M', sku: 'CAM-M', stock: 0 }],
    };

    await expect(useCase.execute(req, productId, updatedBy)).rejects.toThrow(
      new BadRequestException(
        'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
      ),
    );

    expect(productRepository.updateProductWithRelations).not.toHaveBeenCalled();
  });

  it('permite publicar sem enviar variants (a garantia final é do trigger de banco)', async () => {
    productRepository.findById.mockResolvedValue(existingPublicadoProduct);

    const result = await useCase.execute(validRequest, productId, updatedBy);

    expect(productRepository.updateProductWithRelations).toHaveBeenCalledWith(
      productId,
      validRequest,
      updatedBy,
      undefined,
    );
    expect(result).toEqual({ message: 'Produto atualizado com sucesso' });
  });

  it('lança ConflictException quando a escrita falha por violação de unicidade (P2002)', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2002', { target: ['sku'] }),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(new ConflictException('SKU já cadastrado.'));
  });

  it('lança ConflictException quando a escrita falha por concorrência (P2025)', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2025'),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(
      new ConflictException(
        'Produto foi alterado por outra operação, tente novamente.',
      ),
    );
  });

  it('lança NotFoundException quando a escrita falha por violação de chave estrangeira de categoria (P2003)', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2003', { constraint: 'products_category_id_fkey' }),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(new NotFoundException('Categoria não encontrada'));
  });

  it('lança BadRequestException quando a remoção de variante falha por pedidos associados (P2003 na FK de order_items)', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2003', {
        constraint: 'order_items_product_variant_id_fkey',
      }),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(
      new BadRequestException(
        'Não é possível remover: uma ou mais variações possuem pedidos associados. Mantenha essas variações na lista para preservar o histórico de pedidos.',
      ),
    );
  });

  it('lança BadRequestException quando a variante referencia uma cor removida por outra operação (P2003 na FK de product_color_id)', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2003', {
        constraint: 'product_variants_product_color_id_fkey',
      }),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(
      new BadRequestException(
        'Uma ou mais cores referenciadas pelas variações foram alteradas por outra operação, tente novamente.',
      ),
    );
  });

  it('lança BadRequestException genérica quando o P2003 vem de uma constraint de FK não mapeada', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2003', { constraint: 'algum_outro_fkey' }),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(
      new BadRequestException(
        'Conflito ao salvar as relações do produto (categoria ou cor pode ter sido alterada por outra operação); tente novamente.',
      ),
    );
  });

  it('lança ConflictException quando a escrita falha por conflito de transação (P2034)', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      prismaError('P2034'),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(
      new ConflictException(
        'Conflito ao atualizar o produto, tente novamente.',
      ),
    );
  });

  it('lança BadRequestException quando o trigger de banco rejeita a escrita por falta de estoque', async () => {
    productRepository.updateProductWithRelations.mockRejectedValue(
      new Prisma.PrismaClientUnknownRequestError(
        'PRODUCT_INSUFFICIENT_STOCK: produto 10 está com status PUBLICADO mas não possui nenhuma variação com estoque disponível',
        { clientVersion: '6.19.3' },
      ),
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(
      new BadRequestException(
        'Produto com status PUBLICADO deve ter ao menos uma variação com estoque disponível.',
      ),
    );
  });

  it('propaga erros desconhecidos sem convertê-los em exception HTTP', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    productRepository.updateProductWithRelations.mockRejectedValue(
      unknownError,
    );

    await expect(
      useCase.execute(validRequest, productId, updatedBy),
    ).rejects.toThrow(unknownError);
  });
});
