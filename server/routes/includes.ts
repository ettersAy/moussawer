/**
 * Prisma `include` objects used by route handlers to fetch related data.
 *
 * DEPENDENCY CHAIN: Route → Include (this file) → Resource Serializer (server/services/resources.ts)
 *
 * When adding a field to a resource serializer (e.g. in `resources.ts`), you MUST:
 * 1. Add the relation/field to the corresponding include object here
 * 2. Expand the resource function's return object in `resources.ts`
 * 3. If the input type changes, update all callers (run `./scripts/audit-resource-callers.sh`)
 *
 * Each include is paired with a resource function exported from `server/services/resources.ts`.
 *
 * | Include | Resource function | Used by routes |
 * |---------|-------------------|----------------|
 * | userInclude | userResource | admin, helpers |
 * | bookingInclude | bookingResource | admin, bookings, helpers, reviews |
 * | photographerInclude | photographerResource | discovery, favorites, photographer, helpers |
 */
import type { Prisma } from "@prisma/client";

export const userInclude = {
  clientProfile: true,
  photographerProfile: {
    select: {
      id: true, slug: true, verified: true, isPublished: true,
      city: true, country: true, startingPrice: true, rating: true
    }
  }
} satisfies Prisma.UserInclude;

export const bookingInclude = {
  client: { select: { id: true, name: true, email: true, avatarUrl: true } },
  photographer: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
  service: true,
  conversations: { select: { id: true } }
} satisfies Prisma.BookingInclude;

export const photographerInclude = {
  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
  categories: { include: { category: true } },
  services: { where: { isActive: true }, include: { category: true }, orderBy: { price: "asc" as const } },
  portfolioItems: { include: { category: true }, orderBy: [{ isFeatured: "desc" as const }, { sortOrder: "asc" as const }] },
  reviews: {
    where: { isModerated: false },
    include: { client: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" as const },
    take: 8
  }
} satisfies Prisma.PhotographerProfileInclude;
