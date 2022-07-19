import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/category",
});

interface CategoryFilterArgs {
  page: string;
  perPage: string;
  isSupcat?: boolean;
}

router.get("/", async (ctx) => {
  let { page, perPage, isSupcat } = <CategoryFilterArgs>(<unknown>ctx.query);
  let _page = parseInt(page) || 1;
  let _perPage = parseInt(perPage) || 10;

  const categories = await prisma.category.findMany({
    where: {
      isSubcat: isSupcat,
    },
    skip: (_page - 1) * _perPage,
    take: _perPage,
    include: {
      subcategories: true,
    },
  });

  let total = await prisma.category.count();
  ctx.body = {
    categories,
    total,
    page: _page,
    perPage: _perPage,
  };
});

router.get("/:id", async (ctx) => {
  const category = await prisma.category.findUnique({
    where: { id: ctx.params.id },
    include: {
      subcategories: true,
    },
  });
  ctx.body = category;
});

export default router;
