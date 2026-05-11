import { Router } from "express";
import { BookingStatus, DisputeStatus, IncidentStatus, Role } from "@prisma/client";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { asyncHandler, ok } from "../../utils/http";

export const router = Router();

router.get(
  "/admin/stats",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      totalPhotographers,
      totalClients,
      totalBookings,
      pendingBookings,
      openIncidents,
      openDisputes,
      messages,
      moderatedPortfolio
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.PHOTOGRAPHER } }),
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.incident.count({ where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.UNDER_REVIEW] } } }),
      prisma.dispute.count({ where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.AWAITING_RESPONSE, DisputeStatus.UNDER_REVIEW] } } }),
      prisma.message.count(),
      prisma.portfolioItem.count({ where: { isModerated: true } })
    ]);

    ok(res, {
      totalUsers,
      totalPhotographers,
      totalClients,
      totalBookings,
      pendingBookings,
      openIncidents,
      openDisputes,
      recentMessages: messages,
      moderationQueue: moderatedPortfolio
    });
  })
);
