import { Module } from '@nestjs/common';
import { CouponsController } from './coupons.controller';
import { CreateCouponUseCase } from './application/use-cases/create-coupon.use-case';
import { GetAllCouponsUseCase } from './application/use-cases/get-all-coupons.use-case';
import { FindCouponUseCase } from './application/use-cases/find-coupon.use-case';
import { UpdateCouponUseCase } from './application/use-cases/update-coupon.use-case';
import { DeleteCouponUseCase } from './application/use-cases/delete-coupon.use-case';
import { CouponRepository } from './infrastructure/repositories/coupon.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CouponsController],
  providers: [
    CreateCouponUseCase,
    GetAllCouponsUseCase,
    FindCouponUseCase,
    UpdateCouponUseCase,
    DeleteCouponUseCase,
    CouponRepository,
  ],
})
export class CouponsModule {}
