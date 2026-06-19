import { Module } from '@nestjs/common';
import { CreateLegalPersonUseCase } from './legal-person/application/use-cases/create-legal-person.use-case';
import { DeleteLegalPersonUseCase } from './legal-person/application/use-cases/delete-legal-person.use-case';
import { GetAllLegalPersonsUseCase } from './legal-person/application/use-cases/get-all-legal-persons.use-case';
import { GetLegalPersonByIdUseCase } from './legal-person/application/use-cases/get-legal-person-by-id.use-case';
import { UpdateLegalPersonUseCase } from './legal-person/application/use-cases/update-legal-person.use-case';
import { LegalPersonRepository } from './legal-person/domain/repositories/legal-person.repository';
import { LegalPersonController } from './legal-person/legal-person.controller';
import { CreateNaturalPersonUseCase } from './natural-person/application/use-cases/create-natural-person.use-case';
import { DeleteNaturalPersonUseCase } from './natural-person/application/use-cases/delete-natural-person.use-case';
import { GetAllNaturalPersonsUseCase } from './natural-person/application/use-cases/get-all-natural-persons.use-case';
import { GetNaturalPersonByIdUseCase } from './natural-person/application/use-cases/get-natural-person-by-id.use-case';
import { UpdateNaturalPersonUseCase } from './natural-person/application/use-cases/update-natural-person.use-case';
import { NaturalPersonRepository } from './natural-person/domain/repositories/natural-person.repository';
import { NaturalPersonController } from './natural-person/natural-person.controller';

@Module({
  controllers: [NaturalPersonController, LegalPersonController],
  providers: [
    NaturalPersonRepository,
    CreateNaturalPersonUseCase,
    UpdateNaturalPersonUseCase,
    DeleteNaturalPersonUseCase,
    GetAllNaturalPersonsUseCase,
    GetNaturalPersonByIdUseCase,
    LegalPersonRepository,
    CreateLegalPersonUseCase,
    UpdateLegalPersonUseCase,
    DeleteLegalPersonUseCase,
    GetAllLegalPersonsUseCase,
    GetLegalPersonByIdUseCase,
  ],
})
export class SecretariaModule {}
