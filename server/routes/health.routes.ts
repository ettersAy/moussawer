import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router } from "express";
import { asyncHandler, ok } from "../utils/http";

function gitHash() {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    try {
      return readFileSync(resolve(process.cwd(), ".githash"), "utf-8").trim();
    } catch {
      return "unknown";
    }
  }
}

export const router = Router();

router.get(
  "/health",
  asyncHandler(async (_req, res) => {
    ok(res, { status: "ok", service: "moussawer-api", version: "v1", commit: gitHash() });
  })
);

router.get(
  "/version",
  asyncHandler(async (_req, res) => {
    ok(res, { commit: gitHash(), builtAt: new Date().toISOString() });
  })
);
