import { Injectable, NotFoundException } from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaNotFoundError } from '@shared/utils/prisma-errors';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';

@Injectable()
export class DeletePromotionUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(id: number): Promise<ResponseDefaultDTO> {
    try {
      await this.promotionRepository.delete(id);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Promoção não encontrada');
      }

      throw error;
    }

    return { message: 'Promoção removida com sucesso' };
  }
}
