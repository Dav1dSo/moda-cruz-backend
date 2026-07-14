import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, PromotionMediaType, PromotionStatus } from '@prisma/client';
import { UpdatePromotionUseCase } from './update-promotion.use-case';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';
import { UpdatePromotionRequestDTO } from '../../dtos/request/promotion-request';

function prismaError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('erro prisma', {
    code,
    clientVersion: '6.19.3',
  });
}

describe('UpdatePromotionUseCase', () => {
  let useCase: UpdatePromotionUseCase;
  let promotionRepository: jest.Mocked<
    Pick<PromotionRepository, 'findById' | 'updatePromotion'>
  >;

  const promotionId = 3;

  const validRequest: UpdatePromotionRequestDTO = {
    title: 'Liquidação de Inverno',
    subtitle: 'Descontos de até 50% em toda a loja',
    cta_label: 'Aproveitar',
    cta_href: '/catalogo?promo=inverno',
    media_url: 'https://cdn.example.com/banner.png',
    media_type: PromotionMediaType.GIF,
    status: PromotionStatus.ATIVO,
    starts_at: '2026-08-01T00:00:00.000Z',
    ends_at: '2026-08-31T23:59:59.000Z',
  };

  beforeEach(() => {
    promotionRepository = {
      findById: jest.fn(),
      updatePromotion: jest.fn(),
    };

    useCase = new UpdatePromotionUseCase(
      promotionRepository as unknown as PromotionRepository,
    );

    promotionRepository.findById.mockResolvedValue({
      id: promotionId,
    } as never);
  });

  it('atualiza a promoção quando existe e o período é válido', async () => {
    const result = await useCase.execute(validRequest, promotionId);

    expect(promotionRepository.updatePromotion).toHaveBeenCalledWith(
      promotionId,
      validRequest,
    );
    expect(result).toEqual({ message: 'Promoção atualizada com sucesso' });
  });

  it('lança BadRequestException e não persiste quando ends_at não é posterior a starts_at', async () => {
    await expect(
      useCase.execute(
        {
          ...validRequest,
          starts_at: '2026-08-31T00:00:00.000Z',
          ends_at: '2026-08-01T00:00:00.000Z',
        },
        promotionId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(promotionRepository.updatePromotion).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando a promoção não existe', async () => {
    promotionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(validRequest, promotionId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(promotionRepository.updatePromotion).not.toHaveBeenCalled();
  });

  it('lança NotFoundException quando a escrita falha com P2025 (removida entre a checagem e o update)', async () => {
    promotionRepository.updatePromotion.mockRejectedValue(prismaError('P2025'));

    await expect(
      useCase.execute(validRequest, promotionId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('propaga erros desconhecidos da escrita', async () => {
    const unknownError = new Error('falha inesperada de infraestrutura');
    promotionRepository.updatePromotion.mockRejectedValue(unknownError);

    await expect(useCase.execute(validRequest, promotionId)).rejects.toBe(
      unknownError,
    );
  });
});
