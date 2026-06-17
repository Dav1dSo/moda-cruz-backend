/*
  Warnings:

  - You are about to drop the column `attendance_threshold` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "attendance_threshold",
ALTER COLUMN "must_change_password" SET DEFAULT true;
