/*
  Warnings:

  - You are about to drop the column `environment` on the `organization_asaas_integration` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "organization_asaas_integration_environment_idx";

-- AlterTable
ALTER TABLE "organization_asaas_integration" DROP COLUMN "environment";
