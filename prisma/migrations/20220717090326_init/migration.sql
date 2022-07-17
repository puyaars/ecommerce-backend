-- CreateTable
CREATE TABLE "VariantProperty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "VariantProperty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VariantProperty_name_key" ON "VariantProperty"("name");

-- AddForeignKey
ALTER TABLE "VariantProperty" ADD CONSTRAINT "VariantProperty_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
