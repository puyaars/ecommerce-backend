import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/product",
});

interface ProductFilterArgs {
  page: string;
  perPage: string;
  onSale?: string;
  categoryId?: string;
  brandId?: string;
  priceRange?: string;
  SortBy?: "name" | "price" | "createdAt";
  order?: "asc" | "desc";
}

router.get("/", async (ctx) => {
  let {
    page,
    perPage,
    onSale,
    categoryId,
    brandId,
    SortBy,
    order,
    priceRange,
  } = <ProductFilterArgs>(<unknown>ctx.query);

  let _priceRange = priceRange || "0-0";
  const [min, max] = _priceRange.split("-");
  const minPrice = parseInt(min, 10);
  const maxPrice = parseInt(max, 10);

  let _page = parseInt(page) || 1;
  let _perPage = parseInt(perPage) || 10;

  let categoryIds: string[] = [];

  if (categoryId) {
    let category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        subcategories: true,
      },
    });
    categoryIds = [category!.id];
    if (category?.subcategories) {
      categoryIds = categoryIds.concat(
        category.subcategories.map((subcategory) => subcategory.id)
      );
    }
  }

  let total = await prisma.product.count({
    where: {
      onSale:
        onSale !== undefined ? (onSale === "true" ? true : false) : undefined,
      categoryId: categoryId
        ? {
            in: categoryIds,
          }
        : undefined,
      brandId,
      price: priceRange
        ? {
            gte: minPrice,
            lte: maxPrice,
          }
        : undefined,
    },
  });

  const products = await prisma.product.findMany({
    where: {
      onSale:
        onSale !== undefined ? (onSale === "true" ? true : false) : undefined,
      categoryId: categoryId
        ? {
            in: categoryIds,
          }
        : undefined,
      brandId,
      price: priceRange
        ? {
            gte: minPrice,
            lte: maxPrice,
          }
        : undefined,
    },
    include: {
      category: true,
      brand: true,
      tags: true,
      variants: {
        include: {
          properties: true,
          images: true,
        },
      },
      properties: true,
    },
    orderBy: {
      [SortBy || "name"]: order || "asc",
    },

    skip: (_page - 1) * _perPage,
    take: _perPage,
  });
  ctx.body = {
    products,
    total,
    page: _page,
    perPage: _perPage,
  };
});

router.get("/:id", async (ctx) => {
  const { id } = ctx.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      brand: true,
      tags: true,
      variants: {
        include: {
          properties: true,
          images: true,
        },
      },
      properties: true,
    },
  });
  ctx.body = product;
});

export default router;
