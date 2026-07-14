import { PromotionMediaType, PromotionStatus } from '@prisma/client';
import { GetAllPromotionsUseCase } from './get-all-promotions.use-case';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';
import { GetAllPromotionsFiltersDTO } from '../../dtos/request/promotion-request';

describe('GetAllPromotionsUseCase', () => {
  let useCase: GetAllPromotionsUseCase;
  let promotionRepository: jest.Mocked<Pick<PromotionRepository, 'findAll'>>;

  const filters: GetAllPromotionsFiltersDTO = {
    page: 1,
    per_page: 10,
    search: 'inverno',
    status: PromotionStatus.ATIVO,
  };

  beforeEach(() => {
    promotionRepository = {
      findAll: jest.fn(),
    };

    useCase = new GetAllPromotionsUseCase(
      promotionRepository as unknown as PromotionRepository,
    );
  });

  it('repassa os filtros ao repositório e mapeia a lista com datas em ISO', async () => {
    promotionRepository.findAll.mockResolvedValue([
      {
        id: 1,
        title: 'Liquidação de Inverno',
        subtitle: 'Descontos de até 50%',
        cta_label: 'Aproveitar',
        cta_href: '/catalogo',
        media_url: 'https://cdn.example.com/banner.png',
        media_type: PromotionMediaType.IMAGEM,
        status: PromotionStatus.ATIVO,
        starts_at: new Date('2026-08-01T00:00:00.000Z'),
        ends_at: new Date('2026-08-31T00:00:00.000Z'),
        created_at: new Date('2026-07-01T12:00:00.000Z'),
        updated_at: new Date('2026-07-10T08:30:00.000Z'),
      },
    ]);

    const result = await useCase.execute(filters);

    expect(promotionRepository.findAll).toHaveBeenCalledWith(filters);
    expect(result).toEqual([
      {
        id: 1,
        title: 'Liquidação de Inverno',
        subtitle: 'Descontos de até 50%',
        cta_label: 'Aproveitar',
        cta_href: '/catalogo',
        media_url: 'https://cdn.example.com/banner.png',
        media_type: PromotionMediaType.IMAGEM,
        status: PromotionStatus.ATIVO,
        starts_at: '2026-08-01T00:00:00.000Z',
        ends_at: '2026-08-31T00:00:00.000Z',
        created_at: '2026-07-01T12:00:00.000Z',
        updated_at: '2026-07-10T08:30:00.000Z',
      },
    ]);
  });

  it('retorna lista vazia quando não há promoções', async () => {
    promotionRepository.findAll.mockResolvedValue([]);

    await expect(useCase.execute(filters)).resolves.toEqual([]);
  });
});
