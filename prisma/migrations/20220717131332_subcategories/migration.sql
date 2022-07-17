/*
  Warnings:

  - Added the required column `address` to the `BillingAddress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `BillingAddress` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BillingAddress" DROP CONSTRAINT "BillingAddress_userId_fkey";

-- AlterTable
ALTER TABLE "BillingAddress" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "address2" TEXT,
ADD COLUMN     "email" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAddress" ADD CONSTRAINT "BillingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
