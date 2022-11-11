/*
  Warnings:

  - Made the column `portfolioId` on table `Position` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_portfolioId_fkey";

-- AlterTable
ALTER TABLE "Position" ADD COLUMN     "strategy" TEXT,
ALTER COLUMN "portfolioId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
