import Router from "koa-router";

import prisma from "../db";

const router = new Router({
  prefix: "/order",
});

/*   name      String
  email     String
  address   String
  address2  String?
  street    String
  city      String
  state     String
  zip       String
  country   String
  phone     String
  */

interface BillingAddressArgs {
  name: string;
  email: string;
  address: string;
  address2?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface ItemArgs {
  productId: string;
  quantity: number;
  productVariantId: string;
}

interface OrderArgs {
  items: ItemArgs[];
  billingAddress: BillingAddressArgs;
}

router.post("/", async (ctx) => {
  const { items, billingAddress } = <OrderArgs>(<unknown>ctx.request.body);
  let order = await prisma.order.create({
    data: {
      billing: {
        create: {
          name: billingAddress.name,
          email: billingAddress.email,
          address: billingAddress.address,
          address2: billingAddress.address2,
          street: billingAddress.street,
          city: billingAddress.city,
          state: billingAddress.state,
          zip: billingAddress.zip,
          country: billingAddress.country,
          phone: billingAddress.phone,
        },
      },
    },
  });
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });

    const productVariant = await prisma.productVariant.findUnique({
      where: { id: item.productVariantId },
    });

    if (productVariant!.quantity < item.quantity) {
      ctx.status = 400;
      ctx.body = {
        message: `Not enough inventory for ${product!.name}`,
      };
      return;
    }

    await prisma.productVariant.update({
      where: { id: item.productVariantId },
      data: {
        quantity: productVariant!.quantity - item.quantity,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product!.id,
        productVariantId: productVariant!.id,
        quantity: item.quantity,
        price: productVariant!.price,
      },
    });
  }

  ctx.body = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      billing: true,
      items: true,
    },
  });
});

router.post("/:id/cancel", async (ctx) => {
  const order = await prisma.order.update({
    where: { id: ctx.params.id },
    data: {
      status: "CANCELLED",
    },
  });
  ctx.body = order;
});

router.post("/:id/pay", async (ctx) => {
  const order = await prisma.order.update({
    where: { id: ctx.params.id },
    data: {
      status: "PAID",
    },
  });
  ctx.body = order;
});

export default router;
