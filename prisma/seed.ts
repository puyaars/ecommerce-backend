import { Product } from "./../node_modules/.prisma/client/index.d";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

import path from "path";

// parse price to float e.g. "€145,00" -> 145.00
function parsePrice(price: string) {
  if (!price) return 10;
  return parseFloat(price.replace(",", ".").replace(/[^0-9,.]/g, ""));
}

async function main() {
  const products = JSON.parse(
    fs.readFileSync(path.join(__dirname, "sunglass_women_local.json"), "utf8")
  );

  for (const product of products) {
    let brand =
      (await prisma.brand.findFirst({ where: { name: product.brand } })) ||
      (await prisma.brand.create({
        data: {
          name: product.brand,
        },
      }));

    try {
      let _product = await prisma.product.create({
        data: {
          name: product.name,
          brandId: brand.id,
          onSale: true,
        },
      });

      if (product.colors)
        for (const color of product.colors) {
          let variant = await prisma.productVariant.create({
            data: {
              productId: _product.id,
              name: color.name,
              price: parsePrice(color.offerPrice),
              quantity: color.isOutOfStock ? 0 : 100,
              images: [color.img, color.imgHover],
            },
          });

          let properties = [
            "clusterGroupingColor",
            "isPolarized",
            "isStella",
            "isJunior",
            "lensColor",
            "frameColor",
            "localizedColorLabel",
          ];

          for (const property of properties) {
            await prisma.variantProperty.create({
              data: {
                productId: variant.id,
                name: property,
                value: (color[property] || "").toString(),
              },
            });
          }
        }
    } catch (e) {
      console.log(e);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
