import type { Prisma } from "@prisma/client";

export const userInclude = {
  clientProfile: true,
  photographerProfile: { select: { id: true, slug: true } }
} satisfies Prisma.UserInclude;

export const bookingInclude = {
  client: { select: { id: true, name: true, email: true, avatarUrl: true } },
  photographer: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
  service: true
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
