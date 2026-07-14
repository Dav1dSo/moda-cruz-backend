import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaUniqueConstraintError,
  uniqueConstraintCovers,
} from '@shared/utils/prisma-errors';
import { CreateCouponRequestDTO } from '../../dtos/request/coupon-request';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';
import {
  assertValidCouponDiscount,
  assertValidCouponPeriod,
} from '../validate-coupon-payload';

@Injectable()
export class CreateCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(req: CreateCouponRequestDTO): Promise<ResponseDefaultDTO> {
    assertValidCouponDiscount(req);
    assertValidCouponPeriod(req);

    if (req.user_id !== undefined) {
      const userExists = await this.couponRepository.userExists(req.user_id);

      if (!userExists) {
        throw new BadRequestException('Usuário informado não existe.');
      }
    }

    const existingCoupon = await this.couponRepository.findByCode(req.code);

    if (existingCoupon) {
      throw new ConflictException('Código de cupom já cadastrado.');
    }

    try {
      await this.couponRepository.createCoupon(req);
    } catch (error) {
      if (
        isPrismaUniqueConstraintError(error) &&
        uniqueConstraintCovers(error, 'code')
      ) {
        throw new ConflictException('Código de cupom já cadastrado.');
      }

      if (isPrismaForeignKeyConstraintError(error)) {
        throw new BadRequestException('Usuário informado não existe.');
      }

      throw error;
    }

    return { message: 'Cupom criado com sucesso' };
  }
}
