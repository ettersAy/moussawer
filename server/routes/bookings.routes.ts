import { Router } from "express";
import { addMinutes } from "date-fns";
import { BookingStatus, Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { assertBookableSlot } from "../services/availability";
import { audit, notify } from "../services/notifications";
import { bookingResource } from "../services/resources";
import { AppError, asyncHandler, created, ok, validate } from "../utils/http";
import { assertBookingAccess } from "./helpers";
import { bookingInclude } from "./includes";

export const router = Router();

router.get(
  "/bookings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const where: Prisma.BookingWhereInput =
      req.user!.role === Role.ADMIN
        ? {}
        : req.user!.role === Role.CLIENT
          ? { clientId: req.user!.id }
          : { photographer: { userId: req.user!.id } };
    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { startAt: "desc" }
    });
    ok(res, bookings.map(bookingResource));
  })
);

router.post(
  "/bookings",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        photographerId: z.string(),
        serviceId: z.string(),
        startAt: z.string().datetime({ offset: true }),
        location: z.string().min(3),
        notes: z.string().optional()
      }),
      req.body
    );

    const service = await prisma.photographerService.findFirst({
      where: { id: body.serviceId, photographerId: body.photographerId, isActive: true },
      include: { photographer: { include: { user: true } } }
    });
    if (!service) throw new AppError(404, "NOT_FOUND", "Service not found");

    const startAt = new Date(body.startAt);
    const endAt = addMinutes(startAt, service.durationMinutes);
    await assertBookableSlot(body.photographerId, startAt, endAt);

    const booking = await prisma.booking.create({
      data: {
        clientId: req.user!.id,
        photographerId: body.photographerId,
        serviceId: service.id,
        startAt,
        endAt,
        location: body.location,
        notes: body.notes,
        priceEstimate: service.price
      },
      include: bookingInclude
    });

    const conversation = await prisma.conversation.create({
      data: {
        bookingId: booking.id,
        subject: `Booking request for ${service.title}`,
        participants: {
          create: [{ userId: req.user!.id }, { userId: service.photographer.userId }]
        }
      }
    });

    if (body.notes) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user!.id,
          body: body.notes
        }
      });
    }

    await notify(service.photographer.userId, "booking.requested", "New booking request", `${req.user!.name} requested ${service.title}`, {
      bookingId: booking.id
    });
    await audit(req.user!.id, "booking.create", "Booking", booking.id, { serviceId: service.id });
    created(res, bookingResource(booking));
  })
);

router.get(
  "/bookings/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, bookingResource(await assertBookingAccess(req.params.id, req.user)));
  })
);

router.patch(
  "/bookings/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        status: z.nativeEnum(BookingStatus),
        cancellationReason: z.string().optional()
      }),
      req.body
    );
    const booking = await assertBookingAccess(req.params.id, req.user);
    const isClient = booking.clientId === req.user!.id;
    const isPhotographer = booking.photographer.userId === req.user!.id;
    const allowed: Record<BookingStatus, BookingStatus[]> = {
      PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      COMPLETED: [],
      CANCELLED: []
    };

    if (!allowed[booking.status].includes(body.status)) {
      throw new AppError(422, "INVALID_STATUS_TRANSITION", "That booking status transition is not allowed");
    }

    if (req.user!.role === Role.CLIENT && !(isClient && booking.status === BookingStatus.PENDING && body.status === BookingStatus.CANCELLED)) {
      throw new AppError(403, "FORBIDDEN", "Clients can only cancel pending bookings");
    }

    if (req.user!.role === Role.PHOTOGRAPHER && !isPhotographer) {
      throw new AppError(403, "FORBIDDEN", "Photographers can only manage their own bookings");
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: body.status,
        cancellationReason: body.status === BookingStatus.CANCELLED ? body.cancellationReason : undefined,
        confirmedAt: body.status === BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
        completedAt: body.status === BookingStatus.COMPLETED ? new Date() : booking.completedAt,
        cancelledAt: body.status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt
      },
      include: bookingInclude
    });

    const notifyUserId = req.user!.id === updated.clientId ? updated.photographer.userId : updated.clientId;
    await notify(notifyUserId, `booking.${body.status.toLowerCase()}`, "Booking updated", `Booking is now ${body.status.toLowerCase()}`, {
      bookingId: updated.id
    });
    await audit(req.user!.id, "booking.status_update", "Booking", updated.id, { status: body.status });
    ok(res, bookingResource(updated));
  })
);
