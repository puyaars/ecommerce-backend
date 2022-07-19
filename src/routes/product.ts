import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/product",
});

interface ProductFilterArgs {
  page: string;
  perPage: string;
  onSale?: boolean;
  categoryId?: string;
  brandId?: string;
  SortBy?: "name" | "price" | "createdAt";
  order?: "asc" | "desc";
}

router.get("/", async (ctx) => {
  let { page, perPage, onSale, categoryId, brandId, SortBy, order } = <
    ProductFilterArgs
  >(<unknown>ctx.query);
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
      onSale: onSale,
      categoryId: categoryId
        ? {
            in: categoryIds,
          }
        : undefined,
      brandId,
    },
  });

  const products = await prisma.product.findMany({
    where: {
      onSale: onSale,
      categoryId: categoryId
        ? {
            in: categoryIds,
          }
        : undefined,
      brandId,
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
