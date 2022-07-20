import { Document } from "./../node_modules/swagger2/dist/schema.d";
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

import { loadDocumentSync } from "swagger2";
import { ui, validate } from "swagger2-koa";

const router = new Router({
  prefix: "/api",
})
  .use(routes.routes())
  .use(routes.allowedMethods())
  .use(authRoutes.routes())
  .use(authRoutes.allowedMethods())
  .use(Jwt({ secret: process.env.JWT_SECRET! }))
  .use(adminRoutes.routes())
  .use(adminRoutes.allowedMethods());

const app = new Koa();

app
  .use(Logger())
  .use(Json())
  .use(Bodyparser())
  .use(cors())
  .use(ui(loadDocumentSync("api.yaml") as Document, "/docs"))
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve("./assets"));

export default app;
