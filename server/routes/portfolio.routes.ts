import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth";
import { portfolioResource } from "../services/resources";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../utils/http";
import { requirePhotographerProfile } from "./helpers";

export const router = Router();

router.get(
  "/portfolio",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const photographerId = typeof req.query.photographerId === "string" ? req.query.photographerId : undefined;
    const items = await prisma.portfolioItem.findMany({
      where: { photographerId },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }]
    });
    ok(res, items.map(portfolioResource));
  })
);

router.post(
  "/portfolio",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(
      z.object({
        title: z.string().min(2),
        description: z.string().optional(),
        imageUrl: z.string().url(),
        categoryId: z.string().optional().nullable(),
        tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        sortOrder: z.number().int().optional()
      }),
      req.body
    );
    const item = await prisma.portfolioItem.create({
      data: {
        photographerId: photographer.id,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        categoryId: body.categoryId ?? undefined,
        tags: body.tags?.join(",") ?? "",
        isFeatured: body.isFeatured ?? false,
        sortOrder: body.sortOrder ?? 0
      },
      include: { category: true }
    });
    created(res, portfolioResource(item));
  })
);

router.patch(
  "/portfolio/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await prisma.portfolioItem.findUnique({ where: { id: req.params.id }, include: { photographer: true } });
    if (!item) throw new AppError(404, "NOT_FOUND", "Portfolio item not found");
    if (req.user!.role !== Role.ADMIN && item.photographer.userId !== req.user!.id) {
      throw new AppError(403, "FORBIDDEN", "You cannot edit this portfolio item");
    }
    const body = validate(
      z.object({
        title: z.string().min(2).optional(),
        description: z.string().optional().nullable(),
        imageUrl: z.string().url().optional(),
        categoryId: z.string().optional().nullable(),
        tags: z.array(z.string()).optional(),
        isFeatured: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        isModerated: z.boolean().optional()
      }),
      req.body
    );
    const updated = await prisma.portfolioItem.update({
      where: { id: item.id },
      data: {
        ...body,
        tags: body.tags?.join(",")
      },
      include: { category: true }
    });
    ok(res, portfolioResource(updated));
  })
);

router.delete(
  "/portfolio/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await prisma.portfolioItem.findUnique({ where: { id: req.params.id }, include: { photographer: true } });
    if (!item) throw new AppError(404, "NOT_FOUND", "Portfolio item not found");
    if (req.user!.role !== Role.ADMIN && item.photographer.userId !== req.user!.id) {
      throw new AppError(403, "FORBIDDEN", "You cannot delete this portfolio item");
    }
    await prisma.portfolioItem.delete({ where: { id: item.id } });
    noContent(res);
  })
);
