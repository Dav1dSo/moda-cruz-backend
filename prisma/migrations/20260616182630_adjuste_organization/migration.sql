-- CreateEnum
CREATE TYPE "management_account_type" AS ENUM ('RECEITA', 'DESPESA');

-- CreateEnum
CREATE TYPE "asaas_environment" AS ENUM ('SANDBOX', 'PRODUCAO');

-- CreateEnum
CREATE TYPE "asaas_pix_key_type" AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'ALEATORIA');

-- CreateEnum
CREATE TYPE "asaas_integration_status" AS ENUM ('NAO_CONFIGURADO', 'CONECTADO', 'ERRO_CONEXAO');

-- CreateTable
CREATE TABLE "management_account" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "congregation_id" INTEGER,
    "parent_id" INTEGER,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "management_account_type" NOT NULL,
    "is_analytic" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "management_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_asaas_integration" (
    "id" SERIAL NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "environment" "asaas_environment" NOT NULL DEFAULT 'SANDBOX',
    "access_token" TEXT NOT NULL,
    "wallet_id" VARCHAR(100),
    "pix_key" VARCHAR(255),
    "pix_key_type" "asaas_pix_key_type",
    "status" "asaas_integration_status" NOT NULL DEFAULT 'NAO_CONFIGURADO',
    "last_error_message" TEXT,
    "last_connection_check_at" TIMESTAMP(3),
    "last_balance_synced_at" TIMESTAMP(3),
    "last_known_balance" DECIMAL(15,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_asaas_integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "management_account_organization_id_type_idx" ON "management_account"("organization_id", "type");

-- CreateIndex
CREATE INDEX "management_account_organization_id_code_idx" ON "management_account"("organization_id", "code");

-- CreateIndex
CREATE INDEX "management_account_congregation_id_idx" ON "management_account"("congregation_id");

-- CreateIndex
CREATE INDEX "management_account_parent_id_idx" ON "management_account"("parent_id");

-- CreateIndex
CREATE INDEX "management_account_deleted_at_idx" ON "management_account"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "organization_asaas_integration_organization_id_key" ON "organization_asaas_integration"("organization_id");

-- CreateIndex
CREATE INDEX "organization_asaas_integration_environment_idx" ON "organization_asaas_integration"("environment");

-- CreateIndex
CREATE INDEX "organization_asaas_integration_status_idx" ON "organization_asaas_integration"("status");

-- CreateIndex
CREATE INDEX "organization_asaas_integration_wallet_id_idx" ON "organization_asaas_integration"("wallet_id");

-- CreateIndex
CREATE INDEX "organization_asaas_integration_pix_key_idx" ON "organization_asaas_integration"("pix_key");

-- CreateIndex
CREATE INDEX "organization_asaas_integration_deleted_at_idx" ON "organization_asaas_integration"("deleted_at");

-- AddForeignKey
ALTER TABLE "management_account" ADD CONSTRAINT "management_account_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_account" ADD CONSTRAINT "management_account_congregation_id_organization_id_fkey" FOREIGN KEY ("congregation_id", "organization_id") REFERENCES "congregation"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_account" ADD CONSTRAINT "management_account_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "management_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_asaas_integration" ADD CONSTRAINT "organization_asaas_integration_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
