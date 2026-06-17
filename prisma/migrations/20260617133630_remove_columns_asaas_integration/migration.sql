/*
  Warnings:

  - The values [PRODUCAO] on the enum `asaas_environment` will be removed. If these variants are still used in the database, this will fail.
  - The values [NAO_CONFIGURADO,ERRO_CONEXAO] on the enum `asaas_integration_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [ALEATORIA] on the enum `asaas_pix_key_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [MICRO] on the enum `company_size` will be removed. If these variants are still used in the database, this will fail.
  - The values [FAX] on the enum `contact_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [MEDIO,TECNICO,GRADUACAO,POS_GRADUACAO] on the enum `education_level` will be removed. If these variants are still used in the database, this will fail.
  - The values [CERTIDAO_NASCIMENTO,CERTIDAO_CASAMENTO,COMPROVANTE_RESIDENCIA,EXTRATO_BANCARIO] on the enum `entity_document_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [VOLUNTARIO,BENEFICIARIO] on the enum `entity_role_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [PESSOA_FISICA,PESSOA_JURIDICA] on the enum `entity_type` will be removed. If these variants are still used in the database, this will fail.
  - The values [VIUVO] on the enum `marital_status` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `last_balance_synced_at` on the `organization_asaas_integration` table. All the data in the column will be lost.
  - You are about to drop the column `last_connection_check_at` on the `organization_asaas_integration` table. All the data in the column will be lost.
  - You are about to drop the column `last_error_message` on the `organization_asaas_integration` table. All the data in the column will be lost.
  - You are about to drop the column `last_known_balance` on the `organization_asaas_integration` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "asaas_environment_new" AS ENUM ('SANDBOX', 'PRODUÇÃO');
ALTER TABLE "public"."organization_asaas_integration" ALTER COLUMN "environment" DROP DEFAULT;
ALTER TABLE "organization_asaas_integration" ALTER COLUMN "environment" TYPE "asaas_environment_new" USING ("environment"::text::"asaas_environment_new");
ALTER TYPE "asaas_environment" RENAME TO "asaas_environment_old";
ALTER TYPE "asaas_environment_new" RENAME TO "asaas_environment";
DROP TYPE "public"."asaas_environment_old";
ALTER TABLE "organization_asaas_integration" ALTER COLUMN "environment" SET DEFAULT 'SANDBOX';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "asaas_integration_status_new" AS ENUM ('NÃO_CONFIGURADO', 'CONECTADO', 'ERRO_CONEXÃO');
ALTER TABLE "public"."organization_asaas_integration" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "organization_asaas_integration" ALTER COLUMN "status" TYPE "asaas_integration_status_new" USING ("status"::text::"asaas_integration_status_new");
ALTER TYPE "asaas_integration_status" RENAME TO "asaas_integration_status_old";
ALTER TYPE "asaas_integration_status_new" RENAME TO "asaas_integration_status";
DROP TYPE "public"."asaas_integration_status_old";
ALTER TABLE "organization_asaas_integration" ALTER COLUMN "status" SET DEFAULT 'NÃO_CONFIGURADO';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "asaas_pix_key_type_new" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATÓRIA');
ALTER TABLE "organization_asaas_integration" ALTER COLUMN "pix_key_type" TYPE "asaas_pix_key_type_new" USING ("pix_key_type"::text::"asaas_pix_key_type_new");
ALTER TYPE "asaas_pix_key_type" RENAME TO "asaas_pix_key_type_old";
ALTER TYPE "asaas_pix_key_type_new" RENAME TO "asaas_pix_key_type";
DROP TYPE "public"."asaas_pix_key_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "company_size_new" AS ENUM ('MEI', 'ME', 'PEQUENA', 'MEDIA', 'GRANDE');
ALTER TABLE "legal_person" ALTER COLUMN "company_size" TYPE "company_size_new" USING ("company_size"::text::"company_size_new");
ALTER TYPE "company_size" RENAME TO "company_size_old";
ALTER TYPE "company_size_new" RENAME TO "company_size";
DROP TYPE "public"."company_size_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "contact_type_new" AS ENUM ('EMAIL', 'CELULAR', 'TELEFONE', 'WHATSAPP', 'TELEGRAM', 'OUTRO');
ALTER TABLE "entity_contact" ALTER COLUMN "type" TYPE "contact_type_new" USING ("type"::text::"contact_type_new");
ALTER TYPE "contact_type" RENAME TO "contact_type_old";
ALTER TYPE "contact_type_new" RENAME TO "contact_type";
DROP TYPE "public"."contact_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "education_level_new" AS ENUM ('FUNDAMENTAL', 'MÉDIO', 'TÉCNICO', 'GRADUAÇÃO', 'POS_GRADUAÇÃO', 'MESTRADO', 'DOUTORADO');
ALTER TABLE "person_education" ALTER COLUMN "level" TYPE "education_level_new" USING ("level"::text::"education_level_new");
ALTER TYPE "education_level" RENAME TO "education_level_old";
ALTER TYPE "education_level_new" RENAME TO "education_level";
DROP TYPE "public"."education_level_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "entity_document_type_new" AS ENUM ('RG', 'CNH', 'PASSAPORTE', 'CARTEIRA_TRABALHO', 'CERTIFICADO_MILITAR', 'TITULO_ELEITOR', 'CERTIDÃO_NASCIMENTO', 'CERTIDÃO_CASAMENTO', 'COMPROVANTE_RESIDÊNCIA', 'EXTRATO_BANCÁRIO', 'COMPROVANTE_RENDA', 'CONTRATO', 'CERTIFICADO_ESCOLAR', 'OUTRO');
ALTER TABLE "entity_document" ALTER COLUMN "type" TYPE "entity_document_type_new" USING ("type"::text::"entity_document_type_new");
ALTER TYPE "entity_document_type" RENAME TO "entity_document_type_old";
ALTER TYPE "entity_document_type_new" RENAME TO "entity_document_type";
DROP TYPE "public"."entity_document_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "entity_role_type_new" AS ENUM ('MEMBRO', 'FORNECEDOR', 'CLIENTE', 'FUNCIONARIO', 'PASTOR', 'VOLUNTÁRIO', 'BENEFICIÁRIO', 'DOADOR', 'VISITANTE', 'COLABORADOR');
ALTER TABLE "entity_role" ALTER COLUMN "type" TYPE "entity_role_type_new" USING ("type"::text::"entity_role_type_new");
ALTER TYPE "entity_role_type" RENAME TO "entity_role_type_old";
ALTER TYPE "entity_role_type_new" RENAME TO "entity_role_type";
DROP TYPE "public"."entity_role_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "entity_type_new" AS ENUM ('PESSOA_FíSICA', 'PESSOA_JURÍDICA');
ALTER TABLE "entity" ALTER COLUMN "type" TYPE "entity_type_new" USING ("type"::text::"entity_type_new");
ALTER TYPE "entity_type" RENAME TO "entity_type_old";
ALTER TYPE "entity_type_new" RENAME TO "entity_type";
DROP TYPE "public"."entity_type_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "marital_status_new" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIÚVO', 'SEPARADO');
ALTER TABLE "natural_person" ALTER COLUMN "marital_status" TYPE "marital_status_new" USING ("marital_status"::text::"marital_status_new");
ALTER TYPE "marital_status" RENAME TO "marital_status_old";
ALTER TYPE "marital_status_new" RENAME TO "marital_status";
DROP TYPE "public"."marital_status_old";
COMMIT;

-- AlterTable
ALTER TABLE "organization_asaas_integration" DROP COLUMN "last_balance_synced_at",
DROP COLUMN "last_connection_check_at",
DROP COLUMN "last_error_message",
DROP COLUMN "last_known_balance",
ALTER COLUMN "status" SET DEFAULT 'NÃO_CONFIGURADO';
