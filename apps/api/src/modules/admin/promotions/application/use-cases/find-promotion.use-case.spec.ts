import { NotFoundException } from '@nestjs/common';
import { PromotionMediaType, PromotionStatus } from '@prisma/client';
import { FindPromotionUseCase } from './find-promotion.use-case';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';

describe('FindPromotionUseCase', () => {
  let useCase: FindPromotionUseCase;
  let promotionRepository: jest.Mocked<Pick<PromotionRepository, 'findById'>>;

  const promotionId = 3;

  const promotion = {
    id: promotionId,
    title: 'Liquidação de Inverno',
    subtitle: 'Descontos de até 50% em toda a loja',
    cta_label: 'Aproveitar',
    cta_href: '/catalogo?promo=inverno',
    media_url: 'https://cdn.example.com/banner.png',
    media_type: PromotionMediaType.IMAGEM,
    status: PromotionStatus.ATIVO,
    starts_at: new Date('2026-08-01T00:00:00.000Z'),
    ends_at: new Date('2026-08-31T23:59:59.000Z'),
    created_at: new Date('2026-07-01T12:00:00.000Z'),
    updated_at: new Date('2026-07-10T08:30:00.000Z'),
  };

  beforeEach(() => {
    promotionRepository = {
      findById: jest.fn(),
    };

    useCase = new FindPromotionUseCase(
      promotionRepository as unknown as PromotionRepository,
    );
  });

  it('lança NotFoundException quando a promoção não existe', async () => {
    promotionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(promotionId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('mapeia todos os campos da promoção com datas em ISO', async () => {
    promotionRepository.findById.mockResolvedValue(promotion);

    const result = await useCase.execute(promotionId);

    expect(result).toEqual({
      id: promotionId,
      title: 'Liquidação de Inverno',
      subtitle: 'Descontos de até 50% em toda a loja',
      cta_label: 'Aproveitar',
      cta_href: '/catalogo?promo=inverno',
      media_url: 'https://cdn.example.com/banner.png',
      media_type: PromotionMediaType.IMAGEM,
      status: PromotionStatus.ATIVO,
      starts_at: '2026-08-01T00:00:00.000Z',
      ends_at: '2026-08-31T23:59:59.000Z',
      created_at: '2026-07-01T12:00:00.000Z',
      updated_at: '2026-07-10T08:30:00.000Z',
    });
  });
});
