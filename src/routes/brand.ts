import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/brand",
});

interface BrandFilterArgs {
  page: string;
  perPage: string;
}

router.get("/", async (ctx) => {
  let { page, perPage } = <BrandFilterArgs>(<unknown>ctx.query);
  let _page = parseInt(page) || 1;
  let _perPage = parseInt(perPage) || 10;

  const brands = await prisma.brand.findMany({
    skip: (_page - 1) * _perPage,
    take: _perPage,
  });

  let total = await prisma.brand.count();
  ctx.body = {
    brands,
    total,
    page: _page,
    perPage: _perPage,
  };
});

router.get("/:id", async (ctx) => {
  const brand = await prisma.brand.findUnique({
    where: { id: ctx.params.id },
  });
  ctx.body = brand;
});

export default router;
