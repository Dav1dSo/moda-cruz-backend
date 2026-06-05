/*
  Warnings:

  - Added the required column `telefone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "telefone" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "User_telefone_idx" ON "User"("telefone");
