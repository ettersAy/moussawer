import { Router } from "express";
import { asyncHandler, ok } from "../utils/http";

export const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    ok(res, { status: "ok", service: "moussawer-api", version: "v1" });
  })
);
