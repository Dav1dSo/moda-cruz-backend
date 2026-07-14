import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DeletePromotionUseCase } from './delete-promotion.use-case';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';

function prismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('erro prisma', {
    code,
    clientVersion: '6.19.3',
  });
}

describe('DeletePromotionUseCase', () => {
  let useCase: DeletePromotionUseCase;
  let promotionRepository: jest.Mocked<Pick<PromotionRepository, 'delete'>>;

  const promotionId = 3;

  beforeEach(() => {
    promotionRepository = {
      delete: jest.fn(),
    };

    useCase = new DeletePromotionUseCase(
      promotionRepository as unknown as PromotionRepository,
    );
  });

  it('remove a promoção e retorna mensagem de sucesso', async () => {
    const result = await useCase.execute(promotionId);

    expect(promotionRepository.delete).toHaveBeenCalledWith(promotionId);
    expect(result).toEqual({ message: 'Promoção removida com sucesso' });
  });

  it('lança NotFoundException quando a promoção não existe (P2025)', async () => {
    promotionRepository.delete.mockRejectedValue(prismaError('P2025'));

    await expect(useCase.execute(promotionId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('propaga erros desconhecidos da escrita', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    promotionRepository.delete.mockRejectedValue(unknownError);

    await expect(useCase.execute(promotionId)).rejects.toBe(unknownError);
  });
});
