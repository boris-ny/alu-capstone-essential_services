/*
  Warnings:

  - A unique constraint covering the columns `[businessName]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Business` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Business_businessName_key" ON "Business"("businessName");

-- CreateIndex
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");
