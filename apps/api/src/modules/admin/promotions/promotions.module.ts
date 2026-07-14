import { Module } from '@nestjs/common';
import { PromotionsController } from './promotions.controller';
import { CreatePromotionUseCase } from './application/use-cases/create-promotion.use-case';
import { GetAllPromotionsUseCase } from './application/use-cases/get-all-promotions.use-case';
import { FindPromotionUseCase } from './application/use-cases/find-promotion.use-case';
import { UpdatePromotionUseCase } from './application/use-cases/update-promotion.use-case';
import { DeletePromotionUseCase } from './application/use-cases/delete-promotion.use-case';
import { PromotionRepository } from './infrastructure/repositories/promotion.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PromotionsController],
  providers: [
    CreatePromotionUseCase,
    GetAllPromotionsUseCase,
    FindPromotionUseCase,
    UpdatePromotionUseCase,
    DeletePromotionUseCase,
    PromotionRepository,
  ],
})
export class PromotionsModule {}
