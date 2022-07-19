/*
  Warnings:

  - You are about to drop the column `userId` on the `BillingAddress` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `billingAddressId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BillingAddress" DROP CONSTRAINT "BillingAddress_userId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
ALTER TABLE "BillingAddress" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "userId",
ADD COLUMN     "billingAddressId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "BillingAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
