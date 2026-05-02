import { Router } from "express";
import {
  AccountStatus, BookingStatus, DisputeStatus, IncidentStatus, Role
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { audit } from "../services/notifications";
import { bookingResource, userResource } from "../services/resources";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../utils/http";
import { slugify } from "./helpers";
import { bookingInclude, userInclude } from "./includes";

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

router.get(
  "/admin/users",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ include: userInclude, orderBy: { createdAt: "desc" } });
    ok(res, users.map(userResource));
  })
);

router.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        status: z.nativeEnum(AccountStatus).optional(),
        role: z.nativeEnum(Role).optional()
      }),
      req.body
    );
    const user = await prisma.user.update({ where: { id: req.params.id }, data: body, include: userInclude });
    await audit(req.user!.id, "admin.user_update", "User", user.id, body);
    ok(res, userResource(user));
  })
);

router.post(
  "/admin/categories",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ name: z.string().min(2) }), req.body);
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.name)
      }
    });
    created(res, category);
  })
);

router.get(
  "/admin/bookings",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const where: Prisma.BookingWhereInput = status ? { status: status as BookingStatus } : {};
    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
      take: 100
    });
    ok(res, bookings.map(bookingResource));
  })
);

router.get(
  "/admin/categories",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { photographers: true, services: true, portfolio: true } } }
    });
    ok(res, categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, _count: c._count })));
  })
);

router.patch(
  "/admin/categories/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ name: z.string().min(2) }), req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: body.name, slug: slugify(body.name) }
    });
    ok(res, category);
  })
);

router.delete(
  "/admin/categories/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const refs = await prisma.photographerCategory.count({ where: { categoryId: req.params.id } });
    if (refs > 0) throw new AppError(409, "HAS_REFERENCES", "Cannot delete a category assigned to photographers");
    await prisma.category.delete({ where: { id: req.params.id } });
    noContent(res);
  })
);

router.get(
  "/admin/activity",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const logs = await prisma.activityLog.findMany({
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 80
    });
    ok(res, logs.map((log) => ({ ...log, metadata: JSON.parse(log.metadata) })));
  })
);
