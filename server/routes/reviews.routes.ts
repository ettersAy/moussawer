import { Router } from "express";
import { BookingStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { notify } from "../services/notifications";
import { reviewResource } from "../services/resources";
import { AppError, asyncHandler, created, validate } from "../utils/http";
import { bookingInclude } from "./includes";

export const router = Router();

router.post(
  "/reviews",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        bookingId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional()
      }),
      req.body
    );
    const booking = await prisma.booking.findUnique({ where: { id: body.bookingId }, include: bookingInclude });
    if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");
    if (booking.clientId !== req.user!.id) throw new AppError(403, "FORBIDDEN", "You can only review your own bookings");
    if (booking.status !== BookingStatus.COMPLETED) throw new AppError(422, "VALIDATION_ERROR", "Only completed bookings can be reviewed");

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        clientId: req.user!.id,
        photographerId: booking.photographerId,
        rating: body.rating,
        comment: body.comment
      },
      include: { client: { select: { id: true, name: true, avatarUrl: true } } }
    });

    const aggregate = await prisma.review.aggregate({
      where: { photographerId: booking.photographerId, isModerated: false },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await prisma.photographerProfile.update({
      where: { id: booking.photographerId },
      data: {
        rating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count.rating
      }
    });
    await notify(booking.photographer.userId, "review.created", "New review received", `${req.user!.name} reviewed your session`, {
      reviewId: review.id
    });
    created(res, reviewResource(review));
  })
);
