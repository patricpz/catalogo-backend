import express from "express";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "1mb" }));


  app.use("/api", apiRouter);

  app.use(errorMiddleware);

  return app;
}
