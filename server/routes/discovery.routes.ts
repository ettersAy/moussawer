import { Router } from "express";
import { AccountStatus } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { optionalAuth } from "../middleware/auth";
import { availabilityForDate } from "../services/availability";
import { photographerResource, reviewResource } from "../services/resources";
import { asyncHandler, ok, pagination } from "../utils/http";
import { resolvePhotographer } from "./helpers";
import { photographerInclude } from "./includes";

export const router = Router();

router.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    ok(res, categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug })));
  })
);

router.get(
  "/photographers",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const location = typeof req.query.location === "string" ? req.query.location.trim() : "";
    const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    const sort = typeof req.query.sort === "string" ? req.query.sort : "rating";
    const availabilityDate = typeof req.query.availabilityDate === "string" ? req.query.availabilityDate : "";

    const where: Prisma.PhotographerProfileWhereInput = {
      isPublished: true,
      user: { status: AccountStatus.ACTIVE },
      ...(q
        ? {
            OR: [
              { bio: { contains: q } },
              { city: { contains: q } },
              { user: { name: { contains: q } } },
              { services: { some: { title: { contains: q } } } },
              { categories: { some: { category: { name: { contains: q } } } } }
            ]
          }
        : {}),
      ...(location ? { OR: [{ city: { contains: location } }, { country: { contains: location } }] } : {}),
      ...(category
        ? {
            categories: {
              some: {
                category: {
                  OR: [{ slug: category }, { name: { contains: category } }]
                }
              }
            }
          }
        : {}),
      ...(minPrice || maxPrice
        ? {
            startingPrice: {
              gte: minPrice,
              lte: maxPrice
            }
          }
        : {}),
      ...(minRating ? { rating: { gte: minRating } } : {})
    };

    const orderBy =
      sort === "price"
        ? { startingPrice: "asc" as const }
        : sort === "newest"
          ? { createdAt: "desc" as const }
          : sort === "popularity"
            ? { popularity: "desc" as const }
            : { rating: "desc" as const };

    if (availabilityDate) {
      const candidates = await prisma.photographerProfile.findMany({
        where,
        include: photographerInclude,
        orderBy,
        take: 100
      });
      const filtered = [];
      for (const photographer of candidates) {
        const availability = await availabilityForDate(photographer.id, availabilityDate);
        if (availability.slots.some((slot) => slot.available)) filtered.push(photographer);
      }
      const sliced = filtered.slice(skip, skip + limit);
      return ok(res, sliced.map(photographerResource), {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.max(Math.ceil(filtered.length / limit), 1)
      });
    }

    const [total, photographers] = await Promise.all([
      prisma.photographerProfile.count({ where }),
      prisma.photographerProfile.findMany({ where, include: photographerInclude, orderBy, skip, take: limit })
    ]);

    ok(res, photographers.map(photographerResource), {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    });
  })
);

router.get(
  "/photographers/:identifier",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const photographer = await resolvePhotographer(req.params.identifier);
    await prisma.photographerProfile.update({
      where: { id: photographer.id },
      data: { popularity: { increment: 1 } }
    });
    ok(res, photographerResource(photographer));
  })
);

router.get(
  "/photographers/:identifier/availability",
  asyncHandler(async (req, res) => {
    const photographer = await resolvePhotographer(req.params.identifier);
    const date = typeof req.query.date === "string" ? req.query.date : new Date().toISOString().slice(0, 10);
    let duration = 60;
    if (typeof req.query.serviceId === "string") {
      const service = await prisma.photographerService.findFirst({
        where: { id: req.query.serviceId, photographerId: photographer.id, isActive: true }
      });
      if (service) duration = service.durationMinutes;
    }
    ok(res, await availabilityForDate(photographer.id, date, duration));
  })
);

router.get(
  "/photographers/:identifier/reviews",
  asyncHandler(async (req, res) => {
    const photographer = await resolvePhotographer(req.params.identifier);
    const reviews = await prisma.review.findMany({
      where: { photographerId: photographer.id, isModerated: false },
      include: { client: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" }
    });
    ok(res, reviews.map(reviewResource));
  })
);
