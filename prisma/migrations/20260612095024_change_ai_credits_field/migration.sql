/*
  Warnings:

  - You are about to drop the column `aiCreditis` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "aiCreditis",
ADD COLUMN     "aiCredits" INTEGER NOT NULL DEFAULT 1000;
