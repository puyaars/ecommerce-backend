import { reverse } from "dns";
import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/category",
});

interface ReviewFilterArgs {
  productId: string;
  page: string;
  perPage: string;
  confirmed: boolean;
}

router.get("/", async (ctx) => {
  let { productId, page, perPage, confirmed } = <ReviewFilterArgs>(
    (<unknown>ctx.query)
  );
  let total = await prisma.productReview.count({
    where: { productId, confirmed },
  });

  const reviews = await prisma.productReview.findMany({
    where: { productId, confirmed },
    skip: (parseInt(page) - 1) * parseInt(perPage),
    take: parseInt(perPage),
  });
  ctx.body = {
    reviews,
    total,
    page: parseInt(page),
    perPage: parseInt(perPage),
  };
});

router.post("/confirm/:id", async (ctx) => {
  const review = await prisma.productReview.update({
    where: { id: ctx.params.id },
    data: {
      confirmed: true,
    },
  });
  ctx.body = review;
});

router.post("/reject/:id", async (ctx) => {
  const review = await prisma.productReview.update({
    where: { id: ctx.params.id },
    data: {
      confirmed: false,
    },
  });
  ctx.body = review;
});

router.delete("/:id", async (ctx) => {
  const review = await prisma.productReview.delete({
    where: { id: ctx.params.id },
  });
  ctx.body = review;
});

export default router;
