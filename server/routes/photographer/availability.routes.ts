import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { availabilityForDate } from "../../services/availability";
import { blockResource } from "../../services/resources";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../../utils/http";
import { requirePhotographerProfile } from "../helpers";

export const router = Router();

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
        isActive: z.boolean().optional()
      }),
      req.body
    );

    const rule = await prisma.availabilityRule.findFirst({
      where: { id: req.params.id, photographerId: photographer.id }
    });
    if (!rule) throw new AppError(404, "NOT_FOUND", "Availability rule not found");

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
