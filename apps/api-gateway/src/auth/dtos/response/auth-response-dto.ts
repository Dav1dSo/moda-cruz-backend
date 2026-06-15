import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class AuthLoginResponseDTO {
  @IsJWT()
  @ApiProperty({ description: 'Access token' })
  accessToken!: string;

  @IsJWT()
  @ApiProperty({ description: 'Access token' })
  refreshToken!: string;
}


export class RefreshTokenResponseDTO {
  @ApiProperty({ description: 'Access token' })
  @IsString()
  accessToken!: string;
}
