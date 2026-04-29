import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { apiRouter } from "./routes";
import { config } from "./config";
import { openApiDocument } from "./openapi";
import { errorHandler } from "./utils/http";

export function createApp() {
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  if (!config.isTest) app.use(morgan("dev"));

  app.get("/api/v1/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api/v1", apiRouter);
  app.use(express.static("dist"));

  // SPA fallback — serve index.html for all non-API, non-static routes
  // so react-router can handle client-side routing (login, dashboard, etc.)
  app.get("*", (_req, res) => {
    res.sendFile("index.html", { root: "dist" });
  });

  app.use(errorHandler);
  return app;
}
