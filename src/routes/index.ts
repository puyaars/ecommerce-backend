import { default as ProductRouter } from "./product";
import { default as CategoryRouter } from "./category";
import { default as BrandRouter } from "./brand";
import { default as TagRouter } from "./tag";
import { default as ReviewRouter } from "./review";
import { default as OrderRouter } from "./order";

import Router from "koa-router";

const router = new Router()

  .use(ProductRouter.routes())
  .use(ProductRouter.allowedMethods())
  .use(CategoryRouter.routes())
  .use(CategoryRouter.allowedMethods())
  .use(BrandRouter.routes())
  .use(BrandRouter.allowedMethods())
  .use(TagRouter.routes())
  .use(TagRouter.allowedMethods())
  .use(ReviewRouter.routes())
  .use(ReviewRouter.allowedMethods())
  .use(OrderRouter.routes())
  .use(OrderRouter.allowedMethods());

export default router;
