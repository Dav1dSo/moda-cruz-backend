import { BadRequestException, Injectable } from '@nestjs/common';
import { ResponseDefaultDTO } from '@shared/dtos';
import { CreatePromotionRequestDTO } from '../../dtos/request/promotion-request';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';

@Injectable()
export class CreatePromotionUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(req: CreatePromotionRequestDTO): Promise<ResponseDefaultDTO> {
    if (new Date(req.ends_at) <= new Date(req.starts_at)) {
      throw new BadRequestException(
        'A data de término deve ser posterior à data de início.',
      );
    }

    await this.promotionRepository.createPromotion(req);

    return { message: 'Promoção criada com sucesso' };
  }
}
