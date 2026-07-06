import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserProfileSummaryDTO {
  @ApiProperty()
  @IsInt()
  id!: number;

  @ApiProperty()
  @IsString()
  name!: string;
}

export class GetAllUsersResponseDTO {
  @ApiProperty()
  @IsInt()
  id!: number;

  @IsString()
  name!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  phone!: string | null;

  @ApiProperty()
  @IsBoolean()
  is_active!: boolean;

  @ApiProperty()
  @IsBoolean()
  is_platform_admin!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  last_login_at!: string | null;

  @ApiProperty()
  @IsDateString()
  created_at!: string;

  @ApiProperty({ type: [UserProfileSummaryDTO] })
  profiles!: UserProfileSummaryDTO[];
}

export class GetUserResponseDTO extends GetAllUsersResponseDTO {}
