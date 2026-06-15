-- CreateEnum
CREATE TYPE "entity_type" AS ENUM ('PESSOA_FISICA', 'PESSOA_JURIDICA');

-- CreateEnum
CREATE TYPE "entity_status" AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO', 'FALECIDO');

-- CreateEnum
CREATE TYPE "entity_role_type" AS ENUM ('MEMBRO', 'FORNECEDOR', 'CLIENTE', 'FUNCIONARIO', 'PASTOR', 'VOLUNTARIO', 'BENEFICIARIO', 'DOADOR', 'VISITANTE', 'COLABORADOR');

-- CreateEnum
CREATE TYPE "entity_role_status" AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- CreateEnum
CREATE TYPE "marital_status" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'SEPARADO');

-- CreateEnum
CREATE TYPE "blood_type" AS ENUM ('A_POSITIVO', 'A_NEGATIVO', 'B_POSITIVO', 'B_NEGATIVO', 'AB_POSITIVO', 'AB_NEGATIVO', 'O_POSITIVO', 'O_NEGATIVO');

-- CreateEnum
CREATE TYPE "company_size" AS ENUM ('MEI', 'MICRO', 'PEQUENA', 'MEDIA', 'GRANDE');

-- CreateEnum
CREATE TYPE "entity_document_type" AS ENUM ('RG', 'CNH', 'PASSAPORTE', 'CARTEIRA_TRABALHO', 'CERTIFICADO_MILITAR', 'TITULO_ELEITOR', 'CERTIDAO_NASCIMENTO', 'CERTIDAO_CASAMENTO', 'COMPROVANTE_RESIDENCIA', 'EXTRATO_BANCARIO', 'COMPROVANTE_RENDA', 'CONTRATO', 'CERTIFICADO_ESCOLAR', 'OUTRO');

-- CreateEnum
CREATE TYPE "contact_type" AS ENUM ('EMAIL', 'CELULAR', 'TELEFONE', 'WHATSAPP', 'TELEGRAM', 'FAX', 'OUTRO');

-- CreateEnum
CREATE TYPE "education_level" AS ENUM ('FUNDAMENTAL', 'MEDIO', 'TECNICO', 'GRADUACAO', 'POS_GRADUACAO', 'MESTRADO', 'DOUTORADO');

-- CreateEnum
CREATE TYPE "education_status" AS ENUM ('EM_ANDAMENTO', 'COMPLETO', 'INCOMPLETO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "user_status_change_type" AS ENUM ('ATIVADO', 'DESATIVADO');

-- CreateTable
CREATE TABLE "country" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" CHAR(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "state" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" CHAR(2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "ibge_code" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "city_id" INTEGER NOT NULL,
    "postal_code" CHAR(8),
    "street" VARCHAR(255) NOT NULL,
    "number" VARCHAR(20),
    "complement" VARCHAR(255),
    "neighborhood" VARCHAR(100),
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nationality" (
    "id" SERIAL NOT NULL,
    "country_id" INTEGER,
    "name" VARCHAR(100) NOT NULL,
    "gentile" VARCHAR(100),
    "iso_code" CHAR(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nationality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" SERIAL NOT NULL,
    "address_id" INTEGER,
    "cnpj" CHAR(14) NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "state_registration" VARCHAR(50),
    "municipal_registration" VARCHAR(50),
    "foundation_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "congregation_area" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "congregation_area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "congregation_sector" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "area_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "congregation_sector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "congregation" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "area_id" INTEGER,
    "sector_id" INTEGER,
    "address_id" INTEGER,
    "pastor_entity_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "acronym" VARCHAR(50),
    "description" TEXT,
    "cnpj" CHAR(14),
    "foundation_date" DATE,
    "population_capacity" INTEGER,
    "phone" VARCHAR(11),
    "email" VARCHAR(255),
    "logo_path" VARCHAR(500),
    "public_checkout_token" VARCHAR(64),
    "is_public_checkout_enabled" BOOLEAN NOT NULL DEFAULT false,
    "checkout_token_generated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "congregation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "address_id" INTEGER,
    "type" "entity_type" NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "status" "entity_status" NOT NULL DEFAULT 'ATIVO',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "natural_person" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "nationality_id" INTEGER,
    "birth_city_id" INTEGER,
    "full_name" VARCHAR(255) NOT NULL,
    "cpf" CHAR(11),
    "rg" VARCHAR(20),
    "rg_issuer" VARCHAR(100),
    "rg_issue_date" DATE,
    "birth_date" DATE,
    "gender" "gender",
    "marital_status" "marital_status",
    "spouse_name" VARCHAR(255),
    "blood_type" "blood_type",
    "father_name" VARCHAR(255),
    "mother_name" VARCHAR(255),
    "has_disability" BOOLEAN NOT NULL DEFAULT false,
    "disability_type" VARCHAR(150),
    "disability_description" TEXT,
    "photo_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "natural_person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_person" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "legal_name" VARCHAR(255) NOT NULL,
    "trade_name" VARCHAR(255),
    "cnpj" CHAR(14),
    "state_registration" VARCHAR(50),
    "municipal_registration" VARCHAR(50),
    "constitution_date" DATE,
    "company_size" "company_size",
    "legal_nature" VARCHAR(100),
    "logo_path" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_contact" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "type" "contact_type" NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "description" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "valid_from" DATE,
    "valid_until" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entity_contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_document" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "type" "entity_document_type" NOT NULL,
    "document_number" VARCHAR(50),
    "issuing_body" VARCHAR(100),
    "issue_date" DATE,
    "expiry_date" DATE,
    "file_path" VARCHAR(500),
    "file_name" VARCHAR(255),
    "mime_type" VARCHAR(100),
    "file_size" INTEGER,
    "description" VARCHAR(255),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entity_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_role" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "congregation_id" INTEGER,
    "type" "entity_role_type" NOT NULL,
    "status" "entity_role_status" NOT NULL DEFAULT 'ATIVO',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "entity_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_status" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(20),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "congregation_member_role" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "congregation_member_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_detail" (
    "id" SERIAL NOT NULL,
    "entity_role_id" INTEGER NOT NULL,
    "member_status_id" INTEGER,
    "member_number" VARCHAR(50),
    "conversion_date" DATE,
    "water_baptism_date" DATE,
    "spirit_baptism_date" DATE,
    "reception_date" DATE,
    "member_since" DATE,
    "transfer_letter_number" VARCHAR(50),
    "transferred_from" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_role_assignment" (
    "id" SERIAL NOT NULL,
    "entity_role_id" INTEGER NOT NULL,
    "congregation_member_role_id" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "member_role_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_profession" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "occupation_id" INTEGER NOT NULL,
    "company" VARCHAR(255),
    "position" VARCHAR(150),
    "salary" DECIMAL(10,2),
    "start_date" DATE,
    "end_date" DATE,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_profession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_education" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "level" "education_level" NOT NULL,
    "status" "education_status" DEFAULT 'COMPLETO',
    "institution" VARCHAR(255),
    "course" VARCHAR(255),
    "start_year" INTEGER,
    "end_year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_platform_admin" BOOLEAN NOT NULL DEFAULT false,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "attendance_threshold" INTEGER NOT NULL DEFAULT 75,
    "profile_photo_path" VARCHAR(500),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_organization" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "congregation_id" INTEGER NOT NULL,
    "invited_by_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "verified_at" TIMESTAMP(3),
    "invited_at" TIMESTAMP(3),
    "invitation_token_hash" CHAR(64),
    "invitation_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_status_change" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "changed_by_id" INTEGER NOT NULL,
    "status" "user_status_change_type" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_status_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_permission" (
    "id" SERIAL NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "profile_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "profile_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecclesiastical_position" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "hierarchy_level" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecclesiastical_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_ecclesiastical_position" (
    "id" SERIAL NOT NULL,
    "congregation_id" INTEGER NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "ecclesiastical_position_id" INTEGER NOT NULL,
    "created_by_id" INTEGER,
    "ordination_date" DATE,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "member_ecclesiastical_position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_code_key" ON "country"("code");

-- CreateIndex
CREATE INDEX "state_country_id_idx" ON "state"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "state_country_id_code_key" ON "state"("country_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "city_ibge_code_key" ON "city"("ibge_code");

-- CreateIndex
CREATE INDEX "city_state_id_name_idx" ON "city"("state_id", "name");

-- CreateIndex
CREATE INDEX "address_city_id_idx" ON "address"("city_id");

-- CreateIndex
CREATE INDEX "address_postal_code_idx" ON "address"("postal_code");

-- CreateIndex
CREATE UNIQUE INDEX "nationality_name_key" ON "nationality"("name");

-- CreateIndex
CREATE INDEX "nationality_country_id_idx" ON "nationality"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "occupation_name_key" ON "occupation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "organization_address_id_key" ON "organization"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_cnpj_key" ON "organization"("cnpj");

-- CreateIndex
CREATE INDEX "organization_is_active_idx" ON "organization"("is_active");

-- CreateIndex
CREATE INDEX "organization_deleted_at_idx" ON "organization"("deleted_at");

-- CreateIndex
CREATE INDEX "congregation_area_organization_id_is_active_idx" ON "congregation_area"("organization_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_area_organization_id_name_key" ON "congregation_area"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_area_id_organization_id_key" ON "congregation_area"("id", "organization_id");

-- CreateIndex
CREATE INDEX "congregation_sector_organization_id_area_id_idx" ON "congregation_sector"("organization_id", "area_id");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_sector_organization_id_name_key" ON "congregation_sector"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_sector_id_organization_id_key" ON "congregation_sector"("id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_address_id_key" ON "congregation"("address_id");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_cnpj_key" ON "congregation"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_public_checkout_token_key" ON "congregation"("public_checkout_token");

-- CreateIndex
CREATE INDEX "congregation_organization_id_is_active_idx" ON "congregation"("organization_id", "is_active");

-- CreateIndex
CREATE INDEX "congregation_area_id_idx" ON "congregation"("area_id");

-- CreateIndex
CREATE INDEX "congregation_sector_id_idx" ON "congregation"("sector_id");

-- CreateIndex
CREATE INDEX "congregation_parent_id_idx" ON "congregation"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_organization_id_name_key" ON "congregation"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_id_organization_id_key" ON "congregation"("id", "organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "entity_address_id_key" ON "entity"("address_id");

-- CreateIndex
CREATE INDEX "entity_organization_id_type_idx" ON "entity"("organization_id", "type");

-- CreateIndex
CREATE INDEX "entity_organization_id_display_name_idx" ON "entity"("organization_id", "display_name");

-- CreateIndex
CREATE INDEX "entity_status_idx" ON "entity"("status");

-- CreateIndex
CREATE INDEX "entity_deleted_at_idx" ON "entity"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "natural_person_entity_id_key" ON "natural_person"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "natural_person_cpf_key" ON "natural_person"("cpf");

-- CreateIndex
CREATE INDEX "natural_person_full_name_idx" ON "natural_person"("full_name");

-- CreateIndex
CREATE INDEX "natural_person_birth_date_idx" ON "natural_person"("birth_date");

-- CreateIndex
CREATE UNIQUE INDEX "legal_person_entity_id_key" ON "legal_person"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "legal_person_cnpj_key" ON "legal_person"("cnpj");

-- CreateIndex
CREATE INDEX "legal_person_legal_name_idx" ON "legal_person"("legal_name");

-- CreateIndex
CREATE INDEX "legal_person_trade_name_idx" ON "legal_person"("trade_name");

-- CreateIndex
CREATE INDEX "entity_contact_entity_id_type_idx" ON "entity_contact"("entity_id", "type");

-- CreateIndex
CREATE INDEX "entity_contact_value_idx" ON "entity_contact"("value");

-- CreateIndex
CREATE INDEX "entity_document_entity_id_type_idx" ON "entity_document"("entity_id", "type");

-- CreateIndex
CREATE INDEX "entity_document_document_number_idx" ON "entity_document"("document_number");

-- CreateIndex
CREATE INDEX "entity_document_expiry_date_idx" ON "entity_document"("expiry_date");

-- CreateIndex
CREATE INDEX "entity_role_organization_id_type_idx" ON "entity_role"("organization_id", "type");

-- CreateIndex
CREATE INDEX "entity_role_congregation_id_type_idx" ON "entity_role"("congregation_id", "type");

-- CreateIndex
CREATE INDEX "entity_role_status_idx" ON "entity_role"("status");

-- CreateIndex
CREATE UNIQUE INDEX "entity_role_entity_id_type_organization_id_congregation_id_key" ON "entity_role"("entity_id", "type", "organization_id", "congregation_id");

-- CreateIndex
CREATE UNIQUE INDEX "member_status_organization_id_name_key" ON "member_status"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "congregation_member_role_organization_id_name_key" ON "congregation_member_role"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "member_detail_entity_role_id_key" ON "member_detail"("entity_role_id");

-- CreateIndex
CREATE INDEX "member_detail_member_status_id_idx" ON "member_detail"("member_status_id");

-- CreateIndex
CREATE INDEX "member_detail_member_number_idx" ON "member_detail"("member_number");

-- CreateIndex
CREATE INDEX "member_role_assignment_entity_role_id_is_active_idx" ON "member_role_assignment"("entity_role_id", "is_active");

-- CreateIndex
CREATE INDEX "member_role_assignment_congregation_member_role_id_idx" ON "member_role_assignment"("congregation_member_role_id");

-- CreateIndex
CREATE INDEX "person_profession_entity_id_idx" ON "person_profession"("entity_id");

-- CreateIndex
CREATE INDEX "person_profession_occupation_id_idx" ON "person_profession"("occupation_id");

-- CreateIndex
CREATE INDEX "person_education_entity_id_idx" ON "person_education"("entity_id");

-- CreateIndex
CREATE INDEX "person_education_level_idx" ON "person_education"("level");

-- CreateIndex
CREATE UNIQUE INDEX "user_entity_id_key" ON "user"("entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_is_active_idx" ON "user"("is_active");

-- CreateIndex
CREATE INDEX "user_deleted_at_idx" ON "user"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_organization_invitation_token_hash_key" ON "user_organization"("invitation_token_hash");

-- CreateIndex
CREATE INDEX "user_organization_user_id_is_active_idx" ON "user_organization"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "user_organization_organization_id_congregation_id_idx" ON "user_organization"("organization_id", "congregation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_organization_organization_id_user_id_congregation_id_key" ON "user_organization"("organization_id", "user_id", "congregation_id");

-- CreateIndex
CREATE INDEX "user_status_change_user_id_created_at_idx" ON "user_status_change"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "profile_organization_id_name_key" ON "profile"("organization_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permission_slug_key" ON "permission"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "profile_permission_profile_id_permission_id_key" ON "profile_permission"("profile_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_user_id_profile_id_key" ON "user_profile"("user_id", "profile_id");

-- CreateIndex
CREATE INDEX "ecclesiastical_position_organization_id_hierarchy_level_idx" ON "ecclesiastical_position"("organization_id", "hierarchy_level");

-- CreateIndex
CREATE UNIQUE INDEX "ecclesiastical_position_organization_id_name_key" ON "ecclesiastical_position"("organization_id", "name");

-- CreateIndex
CREATE INDEX "member_ecclesiastical_position_congregation_id_is_active_idx" ON "member_ecclesiastical_position"("congregation_id", "is_active");

-- CreateIndex
CREATE INDEX "member_ecclesiastical_position_entity_id_is_active_idx" ON "member_ecclesiastical_position"("entity_id", "is_active");

-- CreateIndex
CREATE INDEX "member_ecclesiastical_position_ecclesiastical_position_id_idx" ON "member_ecclesiastical_position"("ecclesiastical_position_id");

-- AddForeignKey
ALTER TABLE "state" ADD CONSTRAINT "state_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city" ADD CONSTRAINT "city_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "city"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nationality" ADD CONSTRAINT "nationality_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization" ADD CONSTRAINT "organization_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation_area" ADD CONSTRAINT "congregation_area_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation_sector" ADD CONSTRAINT "congregation_sector_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation_sector" ADD CONSTRAINT "congregation_sector_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "congregation_area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "congregation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_area_id_organization_id_fkey" FOREIGN KEY ("area_id", "organization_id") REFERENCES "congregation_area"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_sector_id_organization_id_fkey" FOREIGN KEY ("sector_id", "organization_id") REFERENCES "congregation_sector"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_pastor_entity_id_fkey" FOREIGN KEY ("pastor_entity_id") REFERENCES "entity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity" ADD CONSTRAINT "entity_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity" ADD CONSTRAINT "entity_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natural_person" ADD CONSTRAINT "natural_person_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natural_person" ADD CONSTRAINT "natural_person_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "nationality"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "natural_person" ADD CONSTRAINT "natural_person_birth_city_id_fkey" FOREIGN KEY ("birth_city_id") REFERENCES "city"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_person" ADD CONSTRAINT "legal_person_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_contact" ADD CONSTRAINT "entity_contact_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_document" ADD CONSTRAINT "entity_document_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_role" ADD CONSTRAINT "entity_role_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_role" ADD CONSTRAINT "entity_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_role" ADD CONSTRAINT "entity_role_congregation_id_fkey" FOREIGN KEY ("congregation_id") REFERENCES "congregation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_status" ADD CONSTRAINT "member_status_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation_member_role" ADD CONSTRAINT "congregation_member_role_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_detail" ADD CONSTRAINT "member_detail_entity_role_id_fkey" FOREIGN KEY ("entity_role_id") REFERENCES "entity_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_detail" ADD CONSTRAINT "member_detail_member_status_id_fkey" FOREIGN KEY ("member_status_id") REFERENCES "member_status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_role_assignment" ADD CONSTRAINT "member_role_assignment_entity_role_id_fkey" FOREIGN KEY ("entity_role_id") REFERENCES "entity_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_role_assignment" ADD CONSTRAINT "member_role_assignment_congregation_member_role_id_fkey" FOREIGN KEY ("congregation_member_role_id") REFERENCES "congregation_member_role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profession" ADD CONSTRAINT "person_profession_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_profession" ADD CONSTRAINT "person_profession_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "occupation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_education" ADD CONSTRAINT "person_education_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organization" ADD CONSTRAINT "user_organization_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organization" ADD CONSTRAINT "user_organization_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organization" ADD CONSTRAINT "user_organization_congregation_id_organization_id_fkey" FOREIGN KEY ("congregation_id", "organization_id") REFERENCES "congregation"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_organization" ADD CONSTRAINT "user_organization_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_status_change" ADD CONSTRAINT "user_status_change_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_status_change" ADD CONSTRAINT "user_status_change_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile" ADD CONSTRAINT "profile_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_permission" ADD CONSTRAINT "profile_permission_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_permission" ADD CONSTRAINT "profile_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecclesiastical_position" ADD CONSTRAINT "ecclesiastical_position_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_ecclesiastical_position" ADD CONSTRAINT "member_ecclesiastical_position_congregation_id_fkey" FOREIGN KEY ("congregation_id") REFERENCES "congregation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_ecclesiastical_position" ADD CONSTRAINT "member_ecclesiastical_position_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_ecclesiastical_position" ADD CONSTRAINT "member_ecclesiastical_position_ecclesiastical_position_id_fkey" FOREIGN KEY ("ecclesiastical_position_id") REFERENCES "ecclesiastical_position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_ecclesiastical_position" ADD CONSTRAINT "member_ecclesiastical_position_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
