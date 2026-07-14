import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { isPrismaNotFoundError } from '@shared/utils/prisma-errors';
import { UpdatePromotionRequestDTO } from '../../dtos/request/promotion-request';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';

@Injectable()
export class UpdatePromotionUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(
    req: UpdatePromotionRequestDTO,
    id: number,
  ): Promise<ResponseDefaultDTO> {
    if (new Date(req.ends_at) <= new Date(req.starts_at)) {
      throw new BadRequestException(
        'A data de término deve ser posterior à data de início.',
      );
    }

    const promotion = await this.promotionRepository.findById(id);

    if (!promotion) {
      throw new NotFoundException('Promoção não encontrada');
    }

    try {
      await this.promotionRepository.updatePromotion(id, req);
    } catch (error) {
      if (isPrismaNotFoundError(error)) {
        throw new NotFoundException('Promoção não encontrada');
      }

      throw error;
    }

    return { message: 'Promoção atualizada com sucesso' };
  }
}
