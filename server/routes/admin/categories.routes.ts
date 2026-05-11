import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { AppError, asyncHandler, created, noContent, ok, validate } from "../../utils/http";
import { slugify } from "../helpers";

export const router = Router();

router.post(
  "/admin/categories",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ name: z.string().min(2) }), req.body);
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: slugify(body.name)
      }
    });
    created(res, category);
  })
);

router.get(
  "/admin/categories",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { photographers: true, services: true, portfolio: true } } }
    });
    ok(res, categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, _count: c._count })));
  })
);

router.patch(
  "/admin/categories/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(z.object({ name: z.string().min(2) }), req.body);
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: body.name, slug: slugify(body.name) }
    });
    ok(res, category);
  })
);

router.delete(
  "/admin/categories/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const refs = await prisma.photographerCategory.count({ where: { categoryId: req.params.id } });
    if (refs > 0) throw new AppError(409, "HAS_REFERENCES", "Cannot delete a category assigned to photographers");
    await prisma.category.delete({ where: { id: req.params.id } });
    noContent(res);
  })
);
