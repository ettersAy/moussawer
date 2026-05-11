import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { audit } from "../../services/notifications";
import { photographerResource } from "../../services/resources";
import { AppError, asyncHandler, ok, validate } from "../../utils/http";
import { requirePhotographerProfile } from "../helpers";
import { photographerInclude } from "../includes";

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
