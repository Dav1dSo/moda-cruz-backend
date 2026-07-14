import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import {
  isPrismaForeignKeyConstraintError,
  isPrismaNotFoundError,
  isPrismaUniqueConstraintError,
  uniqueConstraintCovers,
} from '@shared/utils/prisma-errors';
import { UpdateCouponRequestDTO } from '../../dtos/request/coupon-request';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';
import {
  assertValidCouponDiscount,
  assertValidCouponPeriod,
} from '../validate-coupon-payload';

@Injectable()
export class UpdateCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(
    req: UpdateCouponRequestDTO,
    id: number,
  ): Promise<ResponseDefaultDTO> {
    assertValidCouponDiscount(req);
    assertValidCouponPeriod(req);

    const coupon = await this.couponRepository.findById(id);

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    if (coupon.uses_count > 0 && req.code !== coupon.code) {
      throw new BadRequestException(
        'Não é possível alterar o código de um cupom já utilizado.',
      );
    }

    if (req.user_id !== undefined) {
      const userExists = await this.couponRepository.userExists(req.user_id);

      if (!userExists) {
        throw new BadRequestException('Usuário informado não existe.');
      }
    }

    const couponWithSameCode = await this.couponRepository.findByCode(req.code);

    if (couponWithSameCode && couponWithSameCode.id !== id) {
      throw new ConflictException('Código de cupom já cadastrado.');
    }

    try {
      await this.couponRepository.updateCoupon(id, req);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Cupom não encontrado');
      }

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

    return { message: 'Cupom atualizado com sucesso' };
  }
}
