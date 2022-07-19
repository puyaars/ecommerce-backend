import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/brand",
});

interface BrandArgs {
  name: string;
}

router.post("/", async (ctx) => {
  const { name } = <BrandArgs>(<unknown>ctx.request.body);
  const brand = await prisma.brand.create({
    data: {
      name,
    },
  });
  ctx.body = brand;
});

router.put("/:id", async (ctx) => {
  const { name } = <BrandArgs>(<unknown>ctx.request.body);
  const brand = await prisma.brand.update({
    where: { id: ctx.params.id },
    data: {
      name,
    },
  });
  ctx.body = brand;
});

router.delete("/:id", async (ctx) => {
  const brand = await prisma.brand.delete({
    where: { id: ctx.params.id },
  });
  ctx.body = brand;
});

export default router;
