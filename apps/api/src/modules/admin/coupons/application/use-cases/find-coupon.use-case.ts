import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCouponResponseDTO } from '../../dtos/response/coupon-response';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';

@Injectable()
export class FindCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(id: number): Promise<GetCouponResponseDTO> {
    const coupon = await this.couponRepository.findById(id);

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description ?? null,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toNumber(),
      minimum_purchase: coupon.minimum_purchase?.toNumber() ?? null,
      max_uses: coupon.max_uses ?? null,
      uses_count: coupon.uses_count,
      per_customer_limit: coupon.per_customer_limit ?? null,
      starts_at: coupon.starts_at?.toISOString() ?? null,
      ends_at: coupon.ends_at?.toISOString() ?? null,
      is_active: coupon.is_active,
      user_id: coupon.user_id ?? null,
      created_at: coupon.created_at.toISOString(),
      updated_at: coupon.updated_at.toISOString(),
    };
  }
}
