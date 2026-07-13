import { ApiProperty } from '@nestjs/swagger';

export class UserProfileSummaryDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;
}

export class GetAllUsersResponseDTO {
  @ApiProperty()
  id!: number;

  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  phone!: string | null;

  @ApiProperty()
  is_active!: boolean;

  @ApiProperty()
  is_platform_admin!: boolean;

  @ApiProperty({ required: false })
  last_login_at!: string | null;

  @ApiProperty()
  created_at!: string;

  @ApiProperty({ type: [UserProfileSummaryDTO] })
  profiles!: UserProfileSummaryDTO[];
}

export class GetUserResponseDTO extends GetAllUsersResponseDTO {}
