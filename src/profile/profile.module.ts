import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { CreateProfileService } from './create-profile.service';
import { GetAllProfilesService } from './get-all-profiles.service';
import { AuthModule } from 'src/auth/auth.module';
import { DeleteProfileService } from './delete-profile.service';
import { UpdateProfileService } from './update-profile.service';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [
    CreateProfileService,
    GetAllProfilesService,
    DeleteProfileService,
    UpdateProfileService
  ],
})
export class ProfileModule {}
