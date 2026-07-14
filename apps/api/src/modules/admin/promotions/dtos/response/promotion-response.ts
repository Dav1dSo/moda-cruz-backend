import { ApiProperty } from '@nestjs/swagger';
import { PromotionMediaType, PromotionStatus } from '@prisma/client';

export class GetAllPromotionsResponseDTO {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  subtitle!: string;

  @ApiProperty()
  cta_label!: string;

  @ApiProperty()
  cta_href!: string;

  @ApiProperty()
  media_url!: string;

  @ApiProperty({ enum: PromotionMediaType })
  media_type!: PromotionMediaType;

  @ApiProperty({ enum: PromotionStatus })
  status!: PromotionStatus;

  @ApiProperty()
  starts_at!: string;

  @ApiProperty()
  ends_at!: string;

  @ApiProperty()
  created_at!: string;

  @ApiProperty()
  updated_at!: string;
}

export class GetPromotionResponseDTO extends GetAllPromotionsResponseDTO {}
