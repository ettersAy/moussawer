import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { audit } from "../services/notifications";
import { assertNoBlockOverlap, availabilityForDate } from "../services/availability";
import { blockResource, photographerResource, serviceResource } from "../services/resources";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../utils/http";
import { requirePhotographerProfile } from "./helpers";
import { photographerInclude } from "./includes";

export const router = Router();

router.get(
  "/me/photographer",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    ok(res, photographerResource(await requirePhotographerProfile(req.user!.id)));
  })
);

router.patch(
  "/me/photographer",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        bio: z.string().min(10).optional(),
        city: z.string().min(2).optional(),
        country: z.string().min(2).optional(),
        profileImageUrl: z.string().url().optional().nullable(),
        startingPrice: z.number().int().positive().optional(),
        timezone: z.string().optional(),
        isPublished: z.boolean().optional()
      }),
      req.body
    );

    const photographer = await prisma.photographerProfile.update({
      where: { userId: req.user!.id },
      data: body,
      include: photographerInclude
    });
    await audit(req.user!.id, "photographer.update_profile", "PhotographerProfile", photographer.id);
    ok(res, photographerResource(photographer));
  })
);

router.get(
  "/me/services",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    ok(res, photographer.services.map(serviceResource));
  })
);

router.post(
  "/me/services",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        title: z.string().min(3),
        description: z.string().min(10),
        durationMinutes: z.number().int().min(30).max(720),
        price: z.number().int().min(1),
        categoryId: z.string().optional().nullable()
      }),
      req.body
    );
    const service = await prisma.photographerService.create({
      data: {
        photographerId: photographer.id,
        title: body.title,
        description: body.description,
        durationMinutes: body.durationMinutes,
        price: body.price,
        categoryId: body.categoryId ?? undefined
      },
      include: { category: true }
    });
    await audit(req.user!.id, "service.create", "PhotographerService", service.id);
    created(res, serviceResource(service));
  })
);

router.patch(
  "/me/services/:id",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        durationMinutes: z.number().int().min(30).max(720).optional(),
        price: z.number().int().min(1).optional(),
        categoryId: z.string().optional().nullable(),
        isActive: z.boolean().optional()
      }),
      req.body
    );
    const service = await prisma.photographerService.findFirst({ where: { id: req.params.id, photographerId: photographer.id } });
    if (!service) throw new AppError(404, "NOT_FOUND", "Service not found");
    const updated = await prisma.photographerService.update({
      where: { id: service.id },
      data: body,
      include: { category: true }
    });
    ok(res, serviceResource(updated));
  })
);

router.delete(
  "/me/services/:id",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const service = await prisma.photographerService.findFirst({ where: { id: req.params.id, photographerId: photographer.id } });
    if (!service) throw new AppError(404, "NOT_FOUND", "Service not found");
    await prisma.photographerService.delete({ where: { id: service.id } });
    await audit(req.user!.id, "service.delete", "PhotographerService", service.id);
    noContent(res);
  })
);

// ─── Availability ────────────────────────────────────────────────

router.get(
  "/me/availability",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);

    const rules = await prisma.availabilityRule.findMany({
      where: { photographerId: photographer.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });

    // T7: Accept optional from/to query params for filtering blocks
    const blocksWhere: any = {
      photographerId: photographer.id,
      endAt: { gte: new Date() }
    };

    if (typeof req.query.from === "string" && req.query.from.length > 0) {
      const fromDate = new Date(req.query.from);
      if (!Number.isNaN(fromDate.getTime())) {
        blocksWhere.endAt = { gte: fromDate };
      }
    }

    if (typeof req.query.to === "string" && req.query.to.length > 0) {
      const toDate = new Date(req.query.to);
      if (!Number.isNaN(toDate.getTime())) {
        blocksWhere.startAt = { ...(blocksWhere.startAt || {}), lte: toDate };
      }
    }

    const blocks = await prisma.calendarBlock.findMany({
      where: blocksWhere,
      orderBy: { startAt: "asc" }
    });

    ok(res, {
      rules,
      blocks: blocks.map(blockResource)
    });
  })
);

// T4: GET /me/availability/range — Batch availability across a date range
// IMPORTANT: This route MUST be before /me/availability/:id to avoid route collision
router.get(
  "/me/availability/range",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);

    const fromStr = typeof req.query.from === "string" ? req.query.from : "";
    const toStr = typeof req.query.to === "string" ? req.query.to : "";

    if (!fromStr || !toStr) {
      throw new AppError(422, "VALIDATION_ERROR", "Both 'from' and 'to' query parameters are required (YYYY-MM-DD)");
    }

    const fromDate = new Date(`${fromStr}T00:00:00`);
    const toDate = new Date(`${toStr}T00:00:00`);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new AppError(422, "VALIDATION_ERROR", "Invalid date format. Use YYYY-MM-DD");
    }

    if (fromDate > toDate) {
      throw new AppError(422, "VALIDATION_ERROR", "'from' date must be before or equal to 'to' date");
    }

    // Limit range to 90 days to prevent abuse
    const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 90) {
      throw new AppError(422, "VALIDATION_ERROR", "Date range cannot exceed 90 days");
    }

    const durationMinutes = typeof req.query.duration === "string" ? parseInt(req.query.duration, 10) || 60 : 60;

    const results = [];
    const cursor = new Date(fromDate);
    while (cursor <= toDate) {
      const dateStr = cursor.toISOString().slice(0, 10);
      try {
        const dayResult = await availabilityForDate(photographer.id, dateStr, durationMinutes);
        results.push(dayResult);
      } catch {
        // If a date has errors (e.g., past date edge case), skip it
        results.push({ date: dateStr, timezone: photographer.timezone, slots: [] });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    ok(res, {
      photographerId: photographer.id,
      from: fromStr,
      to: toStr,
      timezone: photographer.timezone,
      days: results
    });
  })
);

router.post(
  "/me/availability",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        timezone: z.string().optional(),
        // T5: Allow setting isActive on creation
        isActive: z.boolean().optional()
      }),
      req.body
    );
    if (body.startTime >= body.endTime) throw new AppError(422, "VALIDATION_ERROR", "Availability start must be before end");
    const rule = await prisma.availabilityRule.create({
      data: {
        photographerId: photographer.id,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        timezone: body.timezone ?? photographer.timezone,
        isActive: body.isActive ?? true
      }
    });
    created(res, rule);
  })
);

// T2: PATCH /me/availability/:id — Update an availability rule in-place
router.patch(
  "/me/availability/:id",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        timezone: z.string().optional(),
        // T5: Allow toggling isActive
        isActive: z.boolean().optional()
      }),
      req.body
    );

    const rule = await prisma.availabilityRule.findFirst({
      where: { id: req.params.id, photographerId: photographer.id }
    });
    if (!rule) throw new AppError(404, "NOT_FOUND", "Availability rule not found");

    // Validate start < end if both are being provided or one is being changed
    const effectiveStart = body.startTime ?? rule.startTime;
    const effectiveEnd = body.endTime ?? rule.endTime;
    if (effectiveStart >= effectiveEnd) {
      throw new AppError(422, "VALIDATION_ERROR", "Availability start must be before end");
    }

    const updated = await prisma.availabilityRule.update({
      where: { id: rule.id },
      data: body
    });
    ok(res, updated);
  })
);

router.delete(
  "/me/availability/:id",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const rule = await prisma.availabilityRule.findFirst({ where: { id: req.params.id, photographerId: photographer.id } });
    if (!rule) throw new AppError(404, "NOT_FOUND", "Availability rule not found");
    await prisma.availabilityRule.delete({ where: { id: rule.id } });
    noContent(res);
  })
);

// ─── Calendar Blocks ─────────────────────────────────────────────

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

    // T6: Validate no overlap with existing calendar blocks
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

// T3: PATCH /me/calendar-blocks/:id — Update a calendar block
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

    // Parse updated dates, keeping originals if not provided
    const startAt = body.startAt ? new Date(body.startAt) : block.startAt;
    const endAt = body.endAt ? new Date(body.endAt) : block.endAt;

    if (startAt >= endAt) {
      throw new AppError(422, "VALIDATION_ERROR", "Block start must be before end");
    }

    // T6: Validate no overlap with other calendar blocks (excluding this one)
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

// T1: DELETE /me/calendar-blocks/:id — Remove a calendar block
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
    await prisma.calendarBlock.delete({ where: { id: block.id } });
    await audit(req.user!.id, "calendar_block.delete", "CalendarBlock", block.id);
    noContent(res);
  })
);
