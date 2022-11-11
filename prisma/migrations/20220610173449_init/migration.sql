-- CreateTable
CREATE TABLE "Portfolio" (
    "id" SERIAL NOT NULL,
    "maxVarInDollar" DOUBLE PRECISION NOT NULL,
    "maxOpenTradeSameSymbolSameDirection" INTEGER NOT NULL,
    "nbComputePeriods" INTEGER NOT NULL,
    "zscore" DOUBLE PRECISION NOT NULL,
    "timeframe" TEXT NOT NULL,
    "nameId" TEXT NOT NULL,
    "valueAtRisk" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "pair" TEXT NOT NULL,
    "dollarAmount" DOUBLE PRECISION NOT NULL,
    "direction" TEXT NOT NULL,
    "dataSource" TEXT NOT NULL,
    "portfolioId" INTEGER,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "Portfolio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
