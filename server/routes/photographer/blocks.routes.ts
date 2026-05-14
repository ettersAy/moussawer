import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { audit } from "../../services/notifications";
import { assertNoBlockOverlap } from "../../services/availability";
import { blockResource } from "../../services/resources";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../../utils/http";
import { requirePhotographerProfile } from "../helpers";

export const router = Router();

router.post(
  "/me/calendar-blocks",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        startAt: z.string().datetime({ offset: true }),
        endAt: z.string().datetime({ offset: true }),
        reason: z.string().optional()
      }),
      req.body
    );
    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);
    if (startAt >= endAt) throw new AppError(422, "VALIDATION_ERROR", "Block start must be before end");

    await assertNoBlockOverlap(photographer.id, startAt, endAt);

    const block = await prisma.calendarBlock.create({
      data: {
        photographerId: photographer.id,
        startAt,
        endAt,
        reason: body.reason
      }
    });
    await audit(req.user!.id, "calendar_block.create", "CalendarBlock", block.id);
    created(res, blockResource(block));
  })
);

router.patch(
  "/me/calendar-blocks/:id",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        startAt: z.string().datetime({ offset: true }).optional(),
        endAt: z.string().datetime({ offset: true }).optional(),
        reason: z.string().optional().nullable()
      }),
      req.body
    );

    const block = await prisma.calendarBlock.findFirst({
      where: { id: req.params.id, photographerId: photographer.id }
    });
    if (!block) throw new AppError(404, "NOT_FOUND", "Calendar block not found");
    if (block.source === "google_calendar") throw new AppError(403, "FORBIDDEN", "Google Calendar blocks cannot be modified manually");

    const startAt = body.startAt ? new Date(body.startAt) : block.startAt;
    const endAt = body.endAt ? new Date(body.endAt) : block.endAt;

    if (startAt >= endAt) {
      throw new AppError(422, "VALIDATION_ERROR", "Block start must be before end");
    }

    await assertNoBlockOverlap(photographer.id, startAt, endAt, block.id);

    const updated = await prisma.calendarBlock.update({
      where: { id: block.id },
      data: {
        startAt,
        endAt,
        reason: body.reason !== undefined ? body.reason : block.reason
      }
    });
    await audit(req.user!.id, "calendar_block.update", "CalendarBlock", updated.id);
    ok(res, blockResource(updated));
  })
);

router.delete(
  "/me/calendar-blocks/:id",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const block = await prisma.calendarBlock.findFirst({
      where: { id: req.params.id, photographerId: photographer.id }
    });
    if (!block) throw new AppError(404, "NOT_FOUND", "Calendar block not found");
    if (block.source === "google_calendar") throw new AppError(403, "FORBIDDEN", "Google Calendar blocks cannot be deleted manually");
    await prisma.calendarBlock.delete({ where: { id: block.id } });
    await audit(req.user!.id, "calendar_block.delete", "CalendarBlock", block.id);
    noContent(res);
  })
);
