import Koa from "koa";
import Router from "koa-router";
import Logger from "koa-logger";
import Json from "koa-json";
import Bodyparser from "koa-bodyparser";
import Jwt from "koa-jwt";
import cors from "@koa/cors";

import authRoutes from "./auth";
import adminRoutes from "./admin";
import serve from "koa-static";

import routes from "./routes";

const app = new Koa();

const router = new Router({
  prefix: "/api",
});

app.use(Logger());
app.use(Json());
app.use(Bodyparser());
app.use(cors());

router.use(routes.routes()).use(routes.allowedMethods());

router.use(authRoutes.routes()).use(authRoutes.allowedMethods());

router.use(Jwt({ secret: process.env.JWT_SECRET! }));
router.use(adminRoutes.routes()).use(adminRoutes.allowedMethods());

app.use(router.routes()).use(router.allowedMethods());

app.use(serve("./assets"));

app.listen(4000, () => console.log("Server is running at: " + 4000));
