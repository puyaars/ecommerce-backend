import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/review",
});

interface ReviewArgs {
  productId: string;
  rating: number;
  comment: string;
  name: string;
  email: string;
}

router.post("/", async (ctx) => {
  const { productId, rating, comment, name, email } = <ReviewArgs>(
    (<unknown>ctx.request.body)
  );

  const review = await prisma.productReview.create({
    data: {
      productId,
      rating,
      comment,
      name,
      email,
    },
  });

  ctx.body = review;
});

interface ReviewFilterArgs {
  productId: string;
  page: string;
  perPage: string;
}

router.get("/", async (ctx) => {
  let { productId, page, perPage } = <ReviewFilterArgs>(<unknown>ctx.query);
  let total = await prisma.productReview.count({
    where: { productId, confirmed: true },
  });

  const reviews = await prisma.productReview.findMany({
    where: { productId, confirmed: true },
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

router.get("/rating/:id", async (ctx) => {
  const rating = await prisma.productReview.aggregate({
    _avg: {
      rating: true,
    },
    where: {
      productId: ctx.params.id,
      confirmed: true,
    },
  });
  ctx.body = rating;
});

export default router;
