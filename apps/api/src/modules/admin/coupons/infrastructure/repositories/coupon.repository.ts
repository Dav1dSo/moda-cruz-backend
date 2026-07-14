import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import {
  CreateCouponRequestDTO,
  GetAllCouponsFiltersDTO,
  UpdateCouponRequestDTO,
} from '../../dtos/request/coupon-request';

const COUPON_SELECT = {
  id: true,
  code: true,
  description: true,
  discount_type: true,
  discount_value: true,
  minimum_purchase: true,
  max_uses: true,
  uses_count: true,
  per_customer_limit: true,
  starts_at: true,
  ends_at: true,
  is_active: true,
  user_id: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class CouponRepository {
  constructor(private readonly db: PrismaService) {}

  async findByCode(code: string) {
    return await this.db.coupon.findUnique({
      where: { code },
      select: { id: true },
    });
  }

  async findAll(filters: GetAllCouponsFiltersDTO) {
    const where = {
      OR: filters.search
        ? [
            {
              code: {
                contains: filters.search,
                mode: 'insensitive' as const,
              },
            },
            {
              description: {
                contains: filters.search,
                mode: 'insensitive' as const,
              },
            },
          ]
        : undefined,
      is_active: filters.is_active,
      discount_type: filters.discount_type,
    };

    return await this.db.coupon.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: filters.per_page,
      skip: (filters.page - 1) * filters.per_page,
      select: COUPON_SELECT,
    });
  }

  async findById(id: number) {
    return await this.db.coupon.findUnique({
      where: { id },
      select: COUPON_SELECT,
    });
  }

  async userExists(id: number): Promise<boolean> {
    const user = await this.db.user.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });

    return user !== null;
  }

  async createCoupon(req: CreateCouponRequestDTO): Promise<void> {
    await this.db.coupon.create({
      data: {
        code: req.code,
        description: req.description,
        discount_type: req.discount_type,
        discount_value: req.discount_value,
        minimum_purchase: req.minimum_purchase,
        max_uses: req.max_uses,
        per_customer_limit: req.per_customer_limit,
        starts_at: req.starts_at ? new Date(req.starts_at) : null,
        ends_at: req.ends_at ? new Date(req.ends_at) : null,
        is_active: req.is_active ?? true,
        user_id: req.user_id,
      },
    });
  }

  async updateCoupon(id: number, req: UpdateCouponRequestDTO): Promise<void> {
    await this.db.coupon.update({
      where: { id },
      data: {
        code: req.code,
        description: req.description ?? null,
        discount_type: req.discount_type,
        discount_value: req.discount_value,
        minimum_purchase: req.minimum_purchase ?? null,
        max_uses: req.max_uses ?? null,
        per_customer_limit: req.per_customer_limit ?? null,
        starts_at: req.starts_at ? new Date(req.starts_at) : null,
        ends_at: req.ends_at ? new Date(req.ends_at) : null,
        is_active: req.is_active,
        user_id: req.user_id ?? null,
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.db.coupon.delete({ where: { id } });
  }
}
