import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaNotFoundError } from '@shared/utils/prisma-errors';
import { CouponRepository } from '../../infrastructure/repositories/coupon.repository';

@Injectable()
export class DeleteCouponUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    const coupon = await this.couponRepository.findById(id);

    if (!coupon) {
      throw new NotFoundException('Cupom não encontrado');
    }

    if (coupon.uses_count > 0) {
      throw new BadRequestException(
        'Não é possível remover um cupom já utilizado. Desative-o em vez de remover.',
      );
    }

    try {
      await this.couponRepository.delete(id);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Cupom não encontrado');
      }

      throw error;
    }

    return { message: 'Cupom removido com sucesso' };
  }
}
