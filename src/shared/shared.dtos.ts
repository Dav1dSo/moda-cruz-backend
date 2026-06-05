import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class ResponseDefaultDTO {
    @ApiProperty()
    @IsString()
    message!: string;
}