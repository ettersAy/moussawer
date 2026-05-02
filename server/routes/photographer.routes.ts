import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { audit } from "../services/notifications";
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
    const blocks = await prisma.calendarBlock.findMany({
      where: { photographerId: photographer.id, endAt: { gte: new Date() } },
      orderBy: { startAt: "asc" }
    });
    ok(res, {
      rules,
      blocks: blocks.map(blockResource)
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
        timezone: z.string().optional()
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
        timezone: body.timezone ?? photographer.timezone
      }
    });
    created(res, rule);
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
    const block = await prisma.calendarBlock.create({
      data: {
        photographerId: photographer.id,
        startAt,
        endAt,
        reason: body.reason
      }
    });
    created(res, blockResource(block));
  })
);
