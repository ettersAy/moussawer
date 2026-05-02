import { Router } from "express";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { notificationResource } from "../services/resources";
import { AppError, asyncHandler, ok } from "../utils/http";

export const router = Router();

router.get(
  "/notifications",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    ok(res, notifications.map(notificationResource));
  })
);

router.patch(
  "/notifications/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!notification) throw new AppError(404, "NOT_FOUND", "Notification not found");
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
    ok(res, notificationResource(updated));
  })
);
