import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { CreateProfileUseCase } from './application/use-cases/create-profile.use-case';
import { GetAllProfilesUseCase } from './application/use-cases/get-all-profiles.use-case';
import { AuthModule } from '../../auth/auth.module';
import { DeleteProfileUseCase } from './application/use-cases/delete-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { ProfileRepository } from './infrastructure/repositories/profile.repository';

@Module({
  imports: [AuthModule],
  controllers: [ProfilesController],
  providers: [
    CreateProfileUseCase,
    GetAllProfilesUseCase,
    DeleteProfileUseCase,
    UpdateProfileUseCase,
    ProfileRepository,
  ],
})
export class ProfilesModule {}
