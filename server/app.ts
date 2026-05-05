import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { apiRouter } from "./routes";
import { config } from "./config";
import { openApiDocument } from "./openapi";
import { errorHandler } from "./utils/http";

export function createApp() {
  const app = express();

  // Request ID for error correlation
  app.use((_req, res, next) => {
    res.locals.requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    next();
  });

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? (process.env.NODE_ENV === "production" ? process.env.APP_URL : "*"),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  if (!config.isTest) app.use(morgan("dev"));

  // Rate limiting — only in production (dev/test use in-memory which resets on restart)
  if (process.env.NODE_ENV === "production") {
    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 500,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: { code: "RATE_LIMITED", message: "Too many requests, please try again later" } },
      })
    );

    app.use(
      "/api/v1/auth/login",
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: { code: "RATE_LIMITED", message: "Too many login attempts, please try again later" } },
      })
    );
  }

  app.get("/api/v1/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api/v1", apiRouter);
  app.use(express.static("dist"));

  // Error handler MUST be before SPA fallback to catch API errors
  app.use(errorHandler);

  // SPA fallback — serve index.html for all non-API, non-static routes
  // so react-router can handle client-side routing (login, dashboard, etc.)
  app.get("*", (_req, res) => {
    res.sendFile("index.html", { root: "dist" });
  });
  return app;
}
