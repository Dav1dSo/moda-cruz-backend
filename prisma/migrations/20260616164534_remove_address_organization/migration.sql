/*
  Warnings:

  - You are about to drop the column `address_id` on the `organization` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "organization" DROP CONSTRAINT "organization_address_id_fkey";

-- DropIndex
DROP INDEX "organization_address_id_key";

-- AlterTable
ALTER TABLE "organization" DROP COLUMN "address_id";

-- AlterTable
ALTER TABLE "user_organization" ALTER COLUMN "is_active" SET DEFAULT false;
