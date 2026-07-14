import { Injectable } from '@nestjs/common';
import { GetAllPromotionsFiltersDTO } from '../../dtos/request/promotion-request';
import { GetAllPromotionsResponseDTO } from '../../dtos/response/promotion-response';
import { PromotionRepository } from '../../infrastructure/repositories/promotion.repository';

@Injectable()
export class GetAllPromotionsUseCase {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async execute(
    filters: GetAllPromotionsFiltersDTO,
  ): Promise<GetAllPromotionsResponseDTO[]> {
    const promotions = await this.promotionRepository.findAll(filters);

    return promotions.map((promotion) => ({
      id: promotion.id,
      title: promotion.title,
      subtitle: promotion.subtitle,
      cta_label: promotion.cta_label,
      cta_href: promotion.cta_href,
      media_url: promotion.media_url,
      media_type: promotion.media_type,
      status: promotion.status,
      starts_at: promotion.starts_at.toISOString(),
      ends_at: promotion.ends_at.toISOString(),
      created_at: promotion.created_at.toISOString(),
      updated_at: promotion.updated_at.toISOString(),
    }));
  }
}
