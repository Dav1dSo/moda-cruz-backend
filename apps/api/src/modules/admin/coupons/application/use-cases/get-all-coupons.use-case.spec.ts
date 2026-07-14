import { CouponDiscountType } from '@prisma/client';
import { GetAllCouponsUseCase } from './get-all-coupons.use-case';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';
import { GetAllCouponsFiltersDTO } from '../../dtos/request/coupon-request';

function decimal(value: number) {
  return { toNumber: () => value };
}

describe('GetAllCouponsUseCase', () => {
  let useCase: GetAllCouponsUseCase;
  let couponRepository: jest.Mocked<Pick<CouponRepository, 'findAll'>>;

  const filters: GetAllCouponsFiltersDTO = {
    page: 1,
    per_page: 10,
    search: 'black',
    is_active: true,
    discount_type: CouponDiscountType.PERCENTUAL,
  };

  beforeEach(() => {
    couponRepository = {
      findAll: jest.fn(),
    };

    useCase = new GetAllCouponsUseCase(
      couponRepository as unknown as CouponRepository,
    );
  });

  it('repassa os filtros ao repositório e mapeia a lista', async () => {
    couponRepository.findAll.mockResolvedValue([
      {
        id: 1,
        code: 'BLACKFRIDAY10',
        description: null,
        discount_type: CouponDiscountType.PERCENTUAL,
        discount_value: decimal(10),
        minimum_purchase: null,
        max_uses: null,
        uses_count: 0,
        per_customer_limit: null,
        starts_at: null,
        ends_at: null,
        is_active: true,
        user_id: 7,
        created_at: new Date('2026-07-01T12:00:00.000Z'),
        updated_at: new Date('2026-07-10T08:30:00.000Z'),
      },
    ] as never);

    const result = await useCase.execute(filters);

    expect(couponRepository.findAll).toHaveBeenCalledWith(filters);
    expect(result).toEqual([
      {
        id: 1,
        code: 'BLACKFRIDAY10',
        description: null,
        discount_type: CouponDiscountType.PERCENTUAL,
        discount_value: 10,
        minimum_purchase: null,
        max_uses: null,
        uses_count: 0,
        per_customer_limit: null,
        starts_at: null,
        ends_at: null,
        is_active: true,
        user_id: 7,
        created_at: '2026-07-01T12:00:00.000Z',
        updated_at: '2026-07-10T08:30:00.000Z',
      },
    ]);
  });

  it('retorna lista vazia quando não há cupons', async () => {
    couponRepository.findAll.mockResolvedValue([]);

    await expect(useCase.execute(filters)).resolves.toEqual([]);
  });
});
