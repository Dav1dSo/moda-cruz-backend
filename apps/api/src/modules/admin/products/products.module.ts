import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetAllProductsUseCase } from './application/use-cases/get-all-products.use-case';
import { FindProductUseCase } from './application/use-cases/find-product.use-case';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from './application/use-cases/delete-product.use-case';
import { ProductRepository } from './infrastructure/repositories/product.repository';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProductsController],
  providers: [
    CreateProductUseCase,
    GetAllProductsUseCase,
    FindProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    ProductRepository,
  ],
})
export class ProductsModule {}
