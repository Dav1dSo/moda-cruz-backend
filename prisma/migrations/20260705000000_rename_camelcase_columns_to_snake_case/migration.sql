-- Rename camelCase columns to snake_case (no data loss: RENAME only)

-- profile_permissions
ALTER TABLE "profile_permissions" RENAME COLUMN "profileId" TO "profile_id";

-- user_profiles
ALTER TABLE "user_profiles" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "user_profiles" RENAME COLUMN "profileId" TO "profile_id";
ALTER TABLE "user_profiles" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename indexes to the names Prisma derives from the new column names
ALTER INDEX "profile_permissions_profileId_permission_id_key" RENAME TO "profile_permissions_profile_id_permission_id_key";
ALTER INDEX "user_profiles_profileId_idx" RENAME TO "user_profiles_profile_id_idx";
ALTER INDEX "user_profiles_userId_profileId_key" RENAME TO "user_profiles_user_id_profile_id_key";

-- Rename foreign key constraints to the names Prisma derives from the new column names
ALTER TABLE "profile_permissions" RENAME CONSTRAINT "profile_permissions_profileId_fkey" TO "profile_permissions_profile_id_fkey";
ALTER TABLE "user_profiles" RENAME CONSTRAINT "user_profiles_userId_fkey" TO "user_profiles_user_id_fkey";
ALTER TABLE "user_profiles" RENAME CONSTRAINT "user_profiles_profileId_fkey" TO "user_profiles_profile_id_fkey";
