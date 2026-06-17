import { Module } from '@nestjs/common';
import { OrganizationRepository } from './domain/repository';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { OrganizationsController } from './organization.controller';
import { AuthModule } from '../../auth/auth.module';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationsController],
  providers: [
    OrganizationRepository,
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
  ],
})
export class OrganizationModule {}
