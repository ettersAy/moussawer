import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { photographerResource } from "../services/resources";
import { AppError, asyncHandler, created, noContent, ok } from "../utils/http";
import { photographerInclude } from "./includes";

export const router = Router();

router.get(
  "/favorites",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: { photographer: { include: photographerInclude } },
      orderBy: { createdAt: "desc" }
    });
    ok(res, favorites.map((favorite) => photographerResource(favorite.photographer)));
  })
);

router.post(
  "/favorites/:photographerId",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const photographer = await prisma.photographerProfile.findUnique({ where: { id: req.params.photographerId } });
    if (!photographer) throw new AppError(404, "NOT_FOUND", "Photographer not found");
    const favorite = await prisma.favorite.upsert({
      where: { userId_photographerId: { userId: req.user!.id, photographerId: photographer.id } },
      create: { userId: req.user!.id, photographerId: photographer.id },
      update: {}
    });
    created(res, favorite);
  })
);

router.delete(
  "/favorites/:photographerId",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    await prisma.favorite.deleteMany({ where: { userId: req.user!.id, photographerId: req.params.photographerId } });
    noContent(res);
  })
);
