import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from '@app/database';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/admin/users/users.module';
import { ProfilesModule } from './modules/admin/profiles/profiles.module';
import { PermissionsModule } from './modules/admin/permissions/permissions.module';
import { ProductsModule } from './modules/admin/products/products.module';
import { CategoriesModule } from './modules/admin/categories/categories.module';
import { PublicProductsModule } from './modules/public/products/products.module';
import { PublicCategoriesModule } from './modules/public/categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60,
      },
    ]),

    DatabaseModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    PermissionsModule,
    ProductsModule,
    CategoriesModule,
    PublicProductsModule,
    PublicCategoriesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
