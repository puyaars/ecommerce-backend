import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/tag",
});

interface TagFilterArgs {
  page: string;
  perPage: string;
}

router.get("/", async (ctx) => {
  let { page, perPage } = <TagFilterArgs>(<unknown>ctx.query);
  let _page = parseInt(page) || 1;
  let _perPage = parseInt(perPage) || 10;

  const tags = await prisma.tag.findMany({
    skip: (_page - 1) * _perPage,
    take: _perPage,
  });

  let total = await prisma.tag.count();
  ctx.body = {
    tags,
    total,
    page: _page,
    perPage: _perPage,
  };
});

router.get("/:id", async (ctx) => {
  const tag = await prisma.tag.findUnique({
    where: { id: ctx.params.id },
  });
  ctx.body = tag;
});

export default router;
