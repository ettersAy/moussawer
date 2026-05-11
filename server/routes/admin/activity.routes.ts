import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler, ok, pagination, safeJson } from "../../utils/http";

export const router = Router();

router.get(
  "/admin/activity",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.activityLog.count()
    ]);
    ok(res, logs.map((log) => ({ ...log, metadata: safeJson(log.metadata) })), { page, limit, total });
  })
);
