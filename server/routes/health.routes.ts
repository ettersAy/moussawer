import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Router } from "express";
import { prisma } from "../db";
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
  "/health/db",
  asyncHandler(async (_req, res) => {
    const startedAt = Date.now();
    await prisma.$queryRaw`SELECT 1`;

    ok(res, {
      status: "ok",
      database: "reachable",
      latencyMs: Date.now() - startedAt
    });
  })
);

router.get(
  "/version",
  asyncHandler(async (_req, res) => {
    ok(res, { commit: gitHash(), builtAt: new Date().toISOString() });
  })
);
