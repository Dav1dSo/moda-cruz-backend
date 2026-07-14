import { BadRequestException } from '@nestjs/common';
import { CouponDiscountType } from '@prisma/client';
import { CreateCouponRequestDTO } from '../dtos/request/coupon-request';

const MAX_PERCENTUAL_DISCOUNT = 100;

export function assertValidCouponDiscount(req: CreateCouponRequestDTO): void {
  if (
    req.discount_type === CouponDiscountType.PERCENTUAL &&
    req.discount_value > MAX_PERCENTUAL_DISCOUNT
  ) {
    throw new BadRequestException(
      'Desconto percentual deve ser no máximo 100.',
    );
  }
}

export function assertValidCouponPeriod(req: CreateCouponRequestDTO): void {
  if (
    req.starts_at !== undefined &&
    req.ends_at !== undefined &&
    new Date(req.ends_at) <= new Date(req.starts_at)
  ) {
    throw new BadRequestException(
      'A data de término deve ser posterior à data de início.',
    );
  }
}
