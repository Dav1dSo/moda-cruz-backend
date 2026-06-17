-- DropForeignKey
ALTER TABLE "congregation" DROP CONSTRAINT "congregation_area_id_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "congregation" DROP CONSTRAINT "congregation_sector_id_organization_id_fkey";

-- AlterTable
ALTER TABLE "congregation" ALTER COLUMN "organization_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_area_id_organization_id_fkey" FOREIGN KEY ("area_id", "organization_id") REFERENCES "congregation_area"("id", "organization_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "congregation" ADD CONSTRAINT "congregation_sector_id_organization_id_fkey" FOREIGN KEY ("sector_id", "organization_id") REFERENCES "congregation_sector"("id", "organization_id") ON DELETE SET NULL ON UPDATE CASCADE;
