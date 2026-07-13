import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DeleteProductUseCase } from './delete-product.use-case';
import { ProductRepository } from '../../infrastructure/repositories/product.repository';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let productRepository: jest.Mocked<
    Pick<ProductRepository, 'delete' | 'countDependents'>
  >;

  const productId = 7;

  beforeEach(() => {
    productRepository = {
      delete: jest.fn(),
      countDependents: jest.fn(),
    };

    useCase = new DeleteProductUseCase(
      productRepository as unknown as ProductRepository,
    );
  });

  it('remove o produto quando ele não possui dependências', async () => {
    productRepository.delete.mockResolvedValue(undefined);

    const result = await useCase.execute(productId);

    expect(productRepository.delete).toHaveBeenCalledWith(productId);
    expect(productRepository.countDependents).not.toHaveBeenCalled();
    expect(result).toEqual({ message: 'Produto removido com sucesso' });
  });

  it('lança NotFoundException quando o produto não existe', async () => {
    productRepository.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '6.19.3',
      }),
    );

    await expect(useCase.execute(productId)).rejects.toThrow(
      new NotFoundException('Produto não encontrado'),
    );
  });

  it('lança BadRequestException com a contagem de dependentes quando o banco rejeita o delete por FK', async () => {
    productRepository.delete.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '6.19.3',
        },
      ),
    );
    productRepository.countDependents.mockResolvedValue(4);

    await expect(useCase.execute(productId)).rejects.toThrow(
      new BadRequestException(
        'Não é possível remover: produto vinculado a 4 registro(s) histórico(s). Arquive o produto (status ARQUIVADO) em vez de excluí-lo.',
      ),
    );
    expect(productRepository.countDependents).toHaveBeenCalledWith(productId);
  });

  it('propaga erros inesperados do repositório sem convertê-los', async () => {
    const genericError = new Error('Falha de conexão com o banco');
    productRepository.delete.mockRejectedValue(genericError);

    await expect(useCase.execute(productId)).rejects.toThrow(genericError);
  });
});
