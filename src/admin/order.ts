import { OrderStatus } from "@prisma/client";
import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/order",
});

interface OrderFilters {
  page: string;
  perPage: string;
  status: OrderStatus;
  city: string;
}

router.get("/", async (ctx) => {
  let { page, perPage, status, city } = <OrderFilters>(<unknown>ctx.query);
  let _page = parseInt(page) || 1;
  let _perPage = parseInt(perPage) || 10;
  let _status = status || "";
  let _city = city || "";

  const orders = await prisma.order.findMany({
    skip: (_page - 1) * _perPage,
    take: _perPage,
    where: {
      status: _status,
      billing: {
        city: _city,
      },
    },
  });

  let total = await prisma.order.count({
    where: {
      status: _status,
      billing: {
        city: _city,
      },
    },
  });
  ctx.body = {
    orders,
    total,
    page: _page,
    perPage: _perPage,
  };
});

interface OrderUpdateArgs {
  id: string;
  status: OrderStatus;
}

router.put("/:id", async (ctx) => {
  const { id, status } = <OrderUpdateArgs>(<unknown>ctx.request.body);
  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
    },
  });
  ctx.body = order;
});

export default router;
