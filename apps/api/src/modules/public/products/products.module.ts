import { Module } from '@nestjs/common';
import { PublicProductsController } from './products.controller';
import { GetAllPublicProductsUseCase } from './application/use-cases/get-all-public-products.use-case';
import { FindPublicProductUseCase } from './application/use-cases/find-public-product.use-case';
import { PublicProductRepository } from './infrastructure/repositories/public-product.repository';

@Module({
  controllers: [PublicProductsController],
  providers: [
    GetAllPublicProductsUseCase,
    FindPublicProductUseCase,
    PublicProductRepository,
  ],
})
export class PublicProductsModule {}
