import Router from "koa-router";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "./db";

const router = new Router({
  prefix: "/auth",
});

router.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    ctx.throw(401, "user not found");
  } else if (!(await bcrypt.compare(password, user.hash))) {
    ctx.throw(401, "Invalid password");
  } else {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
    ctx.body = { token };
  }
});

interface RegisterArgs {
  email: string;
  password: string;
  name: string;
}

router.post("/register", async (ctx) => {
  const { email, password, name } = <RegisterArgs>ctx.request.body;
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    ctx.throw(401, "User already exists");
  } else {
    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hash,
        role: "USER",
      },
    });
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET!);
    ctx.body = { token };
  }
});

export default router;
