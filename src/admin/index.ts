import Router from "koa-router";
import prisma from "../db";

import categoryRoutes from "./category";
import brandRoutes from "./brand";
import tagRoutes from "./tag";
import productRoutes from "./product";
import orderRoutes from "./order";
import ReviewRoutes from "./review";

const router = new Router({
  prefix: "/admin",
});

router.use(async (ctx, next) => {
  const user = await prisma.user.findUnique({
    where: { id: ctx.state.user.id },
  });
  if (user && user.role !== "ADMIN") {
    ctx.throw(401, "Unauthorized");
  }
  await next();
});

router.get("/", async (ctx) => {
  ctx.body = "Hello World!";
});

router.use(categoryRoutes.routes()).use(categoryRoutes.allowedMethods());
router.use(brandRoutes.routes()).use(brandRoutes.allowedMethods());
router.use(tagRoutes.routes()).use(tagRoutes.allowedMethods());
router.use(productRoutes.routes()).use(productRoutes.allowedMethods());
router.use(orderRoutes.routes()).use(orderRoutes.allowedMethods());
router.use(ReviewRoutes.routes()).use(ReviewRoutes.allowedMethods());

export default router;
