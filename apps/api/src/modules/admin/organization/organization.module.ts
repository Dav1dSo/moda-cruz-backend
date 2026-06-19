import { Module } from '@nestjs/common';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { OrganizationsController } from './organization.controller';
import { AuthModule } from '../../auth/auth.module';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';
import { GetAllOrganizationsUseCase } from './application/use-cases/get-all-organizations.use-case';
import { GetOrganizationByIdUseCase } from './application/use-cases/get-organization-by-id.use-case';
import { OrganizationRepository } from './domain/repositories/repository';

@Module({
  imports: [AuthModule],
  controllers: [OrganizationsController],
  providers: [
    OrganizationRepository,
    GetAllOrganizationsUseCase,
    GetOrganizationByIdUseCase,
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
  ],
})
export class OrganizationModule {}
