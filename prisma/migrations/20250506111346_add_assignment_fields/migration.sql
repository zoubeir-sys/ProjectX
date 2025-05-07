/*
  Warnings:

  - You are about to drop the column `startDate` on the `Assignment` table. All the data in the column will be lost.
  - Added the required column `description` to the `Assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assignment" DROP COLUMN "startDate",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "pdfUrl" TEXT,
ADD COLUMN     "weightPercentage" INTEGER NOT NULL DEFAULT 20;
