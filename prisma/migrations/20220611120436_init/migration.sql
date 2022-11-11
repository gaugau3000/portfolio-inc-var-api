/*
  Warnings:

  - A unique constraint covering the columns `[nameId]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_nameId_key" ON "Portfolio"("nameId");
