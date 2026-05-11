import { Router } from "express";
import { BookingStatus, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { bookingResource } from "../../services/resources";
import { asyncHandler, ok } from "../../utils/http";
import { bookingInclude } from "../includes";

export const router = Router();

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
