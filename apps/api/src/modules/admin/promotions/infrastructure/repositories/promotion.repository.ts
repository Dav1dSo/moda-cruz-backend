import { PrismaService } from '@app/database';
import { Injectable } from '@nestjs/common';
import { PromotionMediaType, PromotionStatus } from '@prisma/client';
import {
  CreatePromotionRequestDTO,
  GetAllPromotionsFiltersDTO,
  UpdatePromotionRequestDTO,
} from '../../dtos/request/promotion-request';

const PROMOTION_SELECT = {
  id: true,
  title: true,
  subtitle: true,
  cta_label: true,
  cta_href: true,
  media_url: true,
  media_type: true,
  status: true,
  starts_at: true,
  ends_at: true,
  created_at: true,
  updated_at: true,
} as const;

@Injectable()
export class PromotionRepository {
  constructor(private readonly db: PrismaService) {}

  async findAll(filters: GetAllPromotionsFiltersDTO) {
    const where = {
      title: filters.search
        ? { contains: filters.search, mode: 'insensitive' as const }
        : undefined,
      status: filters.status,
    };

    return await this.db.promotion.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: filters.per_page,
      skip: (filters.page - 1) * filters.per_page,
      select: PROMOTION_SELECT,
    });
  }

  async findById(id: number) {
    return await this.db.promotion.findUnique({
      where: { id },
      select: PROMOTION_SELECT,
    });
  }

  async createPromotion(req: CreatePromotionRequestDTO): Promise<void> {
    await this.db.promotion.create({
      data: {
        title: req.title,
        subtitle: req.subtitle,
        cta_label: req.cta_label,
        cta_href: req.cta_href,
        media_url: req.media_url,
        media_type: req.media_type ?? PromotionMediaType.IMAGEM,
        status: req.status ?? PromotionStatus.RASCUNHO,
        starts_at: new Date(req.starts_at),
        ends_at: new Date(req.ends_at),
      },
    });
  }

  async updatePromotion(
    id: number,
    req: UpdatePromotionRequestDTO,
  ): Promise<void> {
    await this.db.promotion.update({
      where: { id },
      data: {
        title: req.title,
        subtitle: req.subtitle,
        cta_label: req.cta_label,
        cta_href: req.cta_href,
        media_url: req.media_url,
        media_type: req.media_type,
        status: req.status,
        starts_at: new Date(req.starts_at),
        ends_at: new Date(req.ends_at),
      },
    });
  }

  async delete(id: number): Promise<void> {
    await this.db.promotion.delete({ where: { id } });
  }
}
