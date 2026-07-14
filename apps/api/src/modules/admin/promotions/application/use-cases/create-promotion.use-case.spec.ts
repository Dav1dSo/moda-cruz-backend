import { BadRequestException } from '@nestjs/common';
import { PromotionMediaType, PromotionStatus } from '@prisma/client';
import { CreatePromotionUseCase } from './create-promotion.use-case';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';
import { CreatePromotionRequestDTO } from '../../dtos/request/promotion-request';

describe('CreatePromotionUseCase', () => {
  let useCase: CreatePromotionUseCase;
  let promotionRepository: jest.Mocked<
    Pick<PromotionRepository, 'createPromotion'>
  >;

  const validRequest: CreatePromotionRequestDTO = {
    title: 'Liquidação de Inverno',
    subtitle: 'Descontos de até 50% em toda a loja',
    cta_label: 'Aproveitar',
    cta_href: '/catalogo?promo=inverno',
    media_url: 'https://cdn.example.com/banner.png',
    media_type: PromotionMediaType.IMAGEM,
    status: PromotionStatus.RASCUNHO,
    starts_at: '2026-08-01T00:00:00.000Z',
    ends_at: '2026-08-31T23:59:59.000Z',
  };

  beforeEach(() => {
    promotionRepository = {
      createPromotion: jest.fn(),
    };

    useCase = new CreatePromotionUseCase(
      promotionRepository as unknown as PromotionRepository,
    );
  });

  it('cria a promoção quando o período é válido', async () => {
    const result = await useCase.execute(validRequest);

    expect(promotionRepository.createPromotion).toHaveBeenCalledWith(
      validRequest,
    );
    expect(result).toEqual({ message: 'Promoção criada com sucesso' });
  });

  it('lança BadRequestException e não persiste quando ends_at é anterior a starts_at', async () => {
    const promise = useCase.execute({
      ...validRequest,
      starts_at: '2026-08-31T00:00:00.000Z',
      ends_at: '2026-08-01T00:00:00.000Z',
    });

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow(
      'A data de término deve ser posterior à data de início.',
    );

    expect(promotionRepository.createPromotion).not.toHaveBeenCalled();
  });

  it('lança BadRequestException quando ends_at é igual a starts_at', async () => {
    await expect(
      useCase.execute({
        ...validRequest,
        starts_at: '2026-08-01T00:00:00.000Z',
        ends_at: '2026-08-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(promotionRepository.createPromotion).not.toHaveBeenCalled();
  });
});
