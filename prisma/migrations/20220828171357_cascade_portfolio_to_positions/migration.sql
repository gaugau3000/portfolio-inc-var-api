-- DropForeignKey
ALTER TABLE "Position" DROP CONSTRAINT "Position_portfolioId_fkey";

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
