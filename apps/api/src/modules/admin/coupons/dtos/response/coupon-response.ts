import { ApiProperty } from '@nestjs/swagger';
import { CouponDiscountType } from '@prisma/client';

export class GetAllCouponsResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  code!: string;

  @ApiProperty({ required: false })
  description!: string | null;

  @ApiProperty({ enum: CouponDiscountType })
  discount_type!: CouponDiscountType;

  @ApiProperty()
  discount_value!: number;

  @ApiProperty({ required: false })
  minimum_purchase!: number | null;

  @ApiProperty({ required: false })
  max_uses!: number | null;

  @ApiProperty()
  uses_count!: number;

  @ApiProperty({ required: false })
  per_customer_limit!: number | null;

  @ApiProperty({ required: false })
  starts_at!: string | null;

  @ApiProperty({ required: false })
  ends_at!: string | null;

  @ApiProperty()
  is_active!: boolean;

  @ApiProperty({ required: false })
  user_id!: number | null;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}

export class GetCouponResponseDTO extends GetAllCouponsResponseDTO {}
