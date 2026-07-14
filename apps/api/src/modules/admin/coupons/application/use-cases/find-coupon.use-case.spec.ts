import { NotFoundException } from '@nestjs/common';
import { CouponDiscountType } from '@prisma/client';
import { FindCouponUseCase } from './find-coupon.use-case';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';

function decimal(value: number) {
  return { toNumber: () => value };
}

describe('FindCouponUseCase', () => {
  let useCase: FindCouponUseCase;
  let couponRepository: jest.Mocked<Pick<CouponRepository, 'findById'>>;

  const couponId = 5;

  const coupon = {
    id: couponId,
    code: 'BLACKFRIDAY10',
    description: 'Desconto de 10%',
    discount_type: CouponDiscountType.PERCENTUAL,
    discount_value: decimal(10),
    minimum_purchase: decimal(100),
    max_uses: 500,
    uses_count: 12,
    per_customer_limit: 1,
    starts_at: new Date('2026-11-20T00:00:00.000Z'),
    ends_at: new Date('2026-11-30T23:59:59.000Z'),
    is_active: true,
    user_id: null,
    created_at: new Date('2026-07-01T12:00:00.000Z'),
    updated_at: new Date('2026-07-10T08:30:00.000Z'),
  };

  beforeEach(() => {
    couponRepository = {
      findById: jest.fn(),
    };

    useCase = new FindCouponUseCase(
      couponRepository as unknown as CouponRepository,
    );
  });

  it('lança NotFoundException quando o cupom não existe', async () => {
    couponRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(couponId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('mapeia todos os campos com Decimals convertidos e datas em ISO', async () => {
    couponRepository.findById.mockResolvedValue(coupon as never);

    const result = await useCase.execute(couponId);

    expect(result).toEqual({
      id: couponId,
      code: 'BLACKFRIDAY10',
      description: 'Desconto de 10%',
      discount_type: CouponDiscountType.PERCENTUAL,
      discount_value: 10,
      minimum_purchase: 100,
      max_uses: 500,
      uses_count: 12,
      per_customer_limit: 1,
      starts_at: '2026-11-20T00:00:00.000Z',
      ends_at: '2026-11-30T23:59:59.000Z',
      is_active: true,
      user_id: null,
      created_at: '2026-07-01T12:00:00.000Z',
      updated_at: '2026-07-10T08:30:00.000Z',
    });
  });

  it('mapeia campos opcionais ausentes como null', async () => {
    couponRepository.findById.mockResolvedValue({
      ...coupon,
      description: null,
      minimum_purchase: null,
      max_uses: null,
      per_customer_limit: null,
      starts_at: null,
      ends_at: null,
    } as never);

    const result = await useCase.execute(couponId);

    expect(result.description).toBeNull();
    expect(result.minimum_purchase).toBeNull();
    expect(result.max_uses).toBeNull();
    expect(result.per_customer_limit).toBeNull();
    expect(result.starts_at).toBeNull();
    expect(result.ends_at).toBeNull();
  });
});
