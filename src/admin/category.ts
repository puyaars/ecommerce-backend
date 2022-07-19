import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/category",
});

interface CategoryFilterArgs {
  page: string;
  perPage: string;
}

router.get("/", async (ctx) => {
  let { page, perPage } = <CategoryFilterArgs>(<unknown>ctx.query);
  let _page = parseInt(page) || 1;
  let _perPage = parseInt(perPage) || 10;

  const categories = await prisma.category.findMany({
    skip: (_page - 1) * _perPage,
    take: _perPage,
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

interface CategoryArgs {
  name: string;
  parentId?: string;
}

router.post("/", async (ctx) => {
  const { name, parentId } = <CategoryArgs>(<unknown>ctx.request.body);
  const category = await prisma.category.create({
    data: {
      name,
      parent: parentId ? { connect: { id: parentId } } : undefined,
      isSubcat: !!parentId,
    },
  });
  ctx.body = category;
});

router.put("/:id", async (ctx) => {
  const { name, parentId } = <CategoryArgs>(<unknown>ctx.request.body);
  const category = await prisma.category.update({
    where: { id: ctx.params.id },
    data: {
      name,
      parent: parentId ? { connect: { id: parentId } } : undefined,
      isSubcat: !!parentId,
    },
  });
  ctx.body = category;
});

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  await prisma.category.updateMany({
    where: {
      parentId: id,
    },
    data: {
      parentId: null,
      isSubcat: false,
    },
  });
};

router.delete("/:id", async (ctx) => {
  const category = await deleteCategory(ctx.params.id);
  ctx.body = category;
});

export default router;
