import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { audit } from "../../services/notifications";
import { serviceResource } from "../../services/resources";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../../utils/http";
import { requirePhotographerProfile } from "../helpers";

export const router = Router();

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
