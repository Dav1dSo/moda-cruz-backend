import { ApiBody, ApiConsumes, ApiProperty } from "@nestjs/swagger";
import { blood_type, gender, marital_status, disability_type } from "@prisma/client";
import { IsBoolean, IsDate, IsEnum, IsInt, IsISO31661Alpha3, IsNotEmpty, isString, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";
import { IsCPF } from "cpf-cnpj-validator/class-validator";

export class NaturalPersonRequestDTO {}

export class CreateNaturalPersonRequestDTO {
    @ApiProperty({
        description: "Número de CPF",
        required: true
    })
    @IsNotEmpty()
    @IsString()
    @IsCPF()
    @IsString()
    cpf!: string 

    @ApiProperty({
        description: 'Nome completo da pessoa',
        required: true
    })
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(100)
    @IsString()
    full_name!: string
    
    
    @ApiProperty({
        description: "Nacionalidade da pessoa",
        required: true
    })
    @IsNotEmpty()
    @IsISO31661Alpha3()
    nacionality!: string


    @ApiProperty({
        description: "Número de RG",
        required: true
    })
    @IsNotEmpty()
    @Matches(/^[0-9A-Za-z.-]+$/, {
        message: 'RG inválido',
    })
    rg!: string;


    @ApiProperty({
        description: "Data de nascimento",
        required: true
    })
    @IsNotEmpty()
    @IsDate()
    birth_date!: Date

    @ApiProperty({
        description: "Gênero",
        required: true,
        enum: gender,
        example: gender.MASCULINO
    })
    @IsNotEmpty()
    @IsEnum(gender)
    @IsString()
    gender!: gender
    
    @ApiProperty({
        description: "Estado civíl",
        required: true,
        isArray: true,
        enum: marital_status,
        example: gender.MASCULINO
    })
    @IsNotEmpty()
    @IsEnum(marital_status)
    @IsString()
    marital_status!: marital_status

    @ApiProperty({
        description: "Cidade de nascimento",
        required: true
    })
    @IsNotEmpty()
    @IsInt()
    city_of_birth!: number

    @ApiProperty({
        description: 'Nome do Pai',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    father_name!: string

    @ApiProperty({
        description: 'Nome da Mãe',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    mothe_name!: string
    @ApiProperty({
        description: 'Nome do cônjugue',
        required: true
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    marital_name!: string

    @ApiProperty({
        description: "Tipo sanguíneo",
        required: true,
        enum: blood_type,
    })
    @IsNotEmpty()
    @IsEnum(blood_type)
    @IsString()
    bloob_type!: string

    @ApiProperty({
        description: "É doador de orgãos",
        required: true
    })
    @IsNotEmpty()
    @IsBoolean()
    is_donor!: boolean

    @ApiProperty({
        description: "É visitante",
        required: true
    })
    @IsNotEmpty()
    @IsBoolean()
    is_visit!: boolean

    @ApiProperty({
        description: "Observações",
        required: false
    })
    @IsString()
    @MaxLength(200)
    notes!: string | null 

    @ApiProperty({
        description: "Possue Deficiência ?",
    })
    @IsBoolean()
    id_desability!: boolean | null


    @ApiProperty({
        description: "Tipo de deficiência",
        enum: disability_type 
    })
    @IsEnum(disability_type)
    @IsString()
    disability_type!: disability_type | null

    @ApiProperty({
        description: "Foto da pessoa"
    })
    photo!: 


}