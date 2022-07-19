import Router from "koa-router";
import fs from "fs";
import body from "koa-body";
import prisma from "../db";

const router = new Router({
  prefix: "/product",
});

interface ProductArgs {
  name: string;
  description: string;
  longDesc: string;
  categoryId: string;
  onSale: boolean;
  tagIds: string[];
  brandId: string;
}

interface ProductVariantUpdateArgs {
  name?: string;
  price?: number;
  quantity?: number;
  isDefault?: boolean;
}

interface ProductUpdateArgs {
  name?: string;
  description?: string;
  categoryId?: string;
  brandId?: string;
  longDesc?: string;
  onSale?: boolean;
}

router.post("/", async (ctx) => {
  const { name, onSale, description, categoryId, brandId, tagIds, longDesc } = <
    ProductArgs
  >(<unknown>ctx.request.body);
  const product = await prisma.product.create({
    data: {
      name,
      description,
      onSale,
      longDesc,
      category: { connect: { id: categoryId } },
      brand: { connect: { id: brandId } },
      tags: { connect: tagIds.map((id) => ({ id })) },
    },
  });
  ctx.body = product;
});

interface PropertyArgs {
  name: string;
  value: string;
}

router.post("/:id/property", async (ctx) => {
  const { name, value } = <PropertyArgs>(<unknown>ctx.request.body);
  const product = await prisma.product.update({
    where: { id: ctx.params.id },
    data: {
      properties: {
        create: {
          name,
          value,
        },
      },
    },
    include: { properties: true },
  });
  ctx.body = product;
});

interface ProductVariantArgs {
  name: string;
  price: number;
  quantity: number;
}

router.post("/variant/:variantId/property", async (ctx) => {
  const { variantId } = ctx.params;
  const { name, value } = <PropertyArgs>(<unknown>ctx.request.body);
  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      properties: {
        create: {
          name,
          value,
        },
      },
    },
    include: { properties: true },
  });
  ctx.body = variant;
});

router.delete("/property/:propertyId", async (ctx) => {
  const { propertyId } = ctx.params;
  const product = await prisma.productProperty.delete({
    where: { id: propertyId },
  });
  ctx.body = product;
});

router.delete("/variant/property/:propertyId", async (ctx) => {
  const { propertyId } = ctx.params;
  const product = await prisma.variantProperty.delete({
    where: { id: propertyId },
  });
  ctx.body = product;
});

router.post(
  "/variant/:id/image",
  body({
    multipart: true,
    formidable: {
      maxFileSize: 200 * 1024 * 1024,
      uploadDir: "./public",
      keepExtensions: true,
    },
  }),
  async (ctx) => {
    const { id } = ctx.params;
    let image = ctx.request.files?.image;
    if (!image) {
      ctx.throw(400, "image is required");
      //   if image is array
    } else {
      if (!Array.isArray(image)) {
        image = [image];
      }
      const images = await Promise.all(
        image.map(async (file) => {
          const { filepath } = file;
          const name = filepath.split("/").pop()!;

          let fileBuffer = fs.readFileSync(filepath);
          fs.writeFileSync(`./assets/${name}`, fileBuffer);

          return name;
        })
      );

      let variant = await prisma.productVariant.findUnique({
        where: { id },
      });

      images.forEach(async (name) => {
        await prisma.productImage.create({
          data: {
            url: `/${name}`,
            product: { connect: { id: variant?.productId } },
            variant: { connect: { id: variant?.id } },
          },
        });
      });

      let product = await prisma.product.findUnique({
        where: { id: variant?.productId },
        include: {
          tags: true,
          properties: true,
          category: true,
          brand: true,
          images: true,
          variants: {
            include: {
              properties: true,
              images: true,
            },
          },
        },
      });

      ctx.body = product;
    }
  }
);

router.delete("/image/:imageId", async (ctx) => {
  const { imageId } = ctx.params;
  const image = await prisma.productImage.delete({
    where: { id: imageId },
  });
  ctx.body = image;
});

router.put("/variant/:variantId", async (ctx) => {
  const { variantId } = ctx.params;
  const { name, price, quantity, isDefault } = <ProductVariantUpdateArgs>(
    (<unknown>ctx.request.body)
  );

  const variant = await prisma.productVariant.update({
    where: { id: variantId },
    data: {
      name,
      price,
      quantity,
    },
  });

  if (isDefault) {
    await prisma.productVariant.updateMany({
      where: {
        productId: variant.productId,
        id: {
          not: variant.id,
        },
      },
      data: { isDefault: false },
    });

    await prisma.product.update({
      where: { id: variant.productId },
      data: {
        price: variant.price,
      },
    });
  }

  ctx.body = variant;
});

router.delete("/:id", async (ctx) => {
  const { id } = ctx.params;
  await prisma.productImage.deleteMany({
    where: { productId: id },
  });
  await prisma.productVariant.deleteMany({
    where: { productId: id },
  });
  const product = await prisma.product.delete({
    where: { id },
  });
  ctx.body = product;
});

router.delete("/:id/variant/:variantId", async (ctx) => {
  const { id, variantId } = ctx.params;
  const variant = await prisma.productVariant.delete({
    where: { id: variantId },
  });
  ctx.body = variant;
});

router.put("/:id", async (ctx) => {
  const { id } = ctx.params;
  const { name, categoryId, brandId, description, longDesc, onSale } = <
    ProductUpdateArgs
  >(<unknown>ctx.request.body);
  const product = await prisma.product.update({
    where: { id },
    data: {
      onSale,
      name,
      description,
      category: categoryId ? { connect: { id: categoryId } } : undefined,
      brand: brandId ? { connect: { id: brandId } } : undefined,
      longDesc,
    },
  });
  ctx.body = product;
});

router.post("/:id/variant", async (ctx) => {
  const { id } = ctx.params;
  const { name, price, quantity } = <ProductVariantArgs>(
    (<unknown>ctx.request.body)
  );

  let hasVariant = await prisma.productVariant.count({
    where: { productId: id },
  });

  let isDefault = hasVariant === 0 ? true : false;

  if (isDefault) {
    await prisma.product.update({
      where: { id },
      data: {
        price,
      },
    });
  }

  const variant = await prisma.productVariant.create({
    data: {
      name,
      price,
      quantity,
      isDefault: hasVariant === 0,
      product: { connect: { id } },
    },
  });
  ctx.body = variant;
});

export default router;
