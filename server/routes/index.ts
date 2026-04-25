import { Router } from "express";
import bcrypt from "bcryptjs";
import { addMinutes } from "date-fns";
import {
  AccountStatus,
  BookingStatus,
  DisputeStatus,
  IncidentStatus,
  Role,
  type Prisma
} from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { optionalAuth, requireAuth, requireRole, signToken } from "../middleware/auth";
import { assertBookableSlot, availabilityForDate } from "../services/availability";
import { audit, notify } from "../services/notifications";
import {
  blockResource,
  bookingResource,
  conversationResource,
  disputeResource,
  incidentResource,
  messageResource,
  notificationResource,
  photographerResource,
  portfolioResource,
  reviewResource,
  serviceResource,
  userResource
} from "../services/resources";
import { AppError, asyncHandler, created, noContent, ok, pagination, validate } from "../utils/http";

export const apiRouter = Router();

const userInclude = {
  clientProfile: true,
  photographerProfile: { select: { id: true, slug: true } }
} satisfies Prisma.UserInclude;

const bookingInclude = {
  client: { select: { id: true, name: true, email: true, avatarUrl: true } },
  photographer: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
  service: true
} satisfies Prisma.BookingInclude;

const photographerInclude = {
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(name: string) {
  const base = slugify(name) || "photographer";
  let slug = base;
  let counter = 1;
  while (await prisma.photographerProfile.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
}

async function currentUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: userInclude });
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
  return user;
}

async function requirePhotographerProfile(userId: string) {
  const photographer = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: photographerInclude
  });
  if (!photographer) throw new AppError(403, "FORBIDDEN", "A photographer profile is required");
  return photographer;
}

async function resolvePhotographer(identifier: string) {
  const photographer = await prisma.photographerProfile.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }]
    },
    include: photographerInclude
  });
  if (!photographer || !photographer.isPublished) throw new AppError(404, "NOT_FOUND", "Photographer not found");
  return photographer;
}

async function assertBookingAccess(bookingId: string, user: Express.Request["user"]) {
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: bookingInclude });
  if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");
  const isPhotographer = booking.photographer.userId === user.id;
  const isClient = booking.clientId === user.id;
  if (user.role !== Role.ADMIN && !isPhotographer && !isClient) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this booking");
  }
  return booking;
}

async function assertConversationAccess(conversationId: string, user: Express.Request["user"]) {
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: { include: { user: { select: { id: true, name: true, role: true, avatarUrl: true } } } }
    }
  });
  if (!conversation) throw new AppError(404, "NOT_FOUND", "Conversation not found");
  const participates = conversation.participants.some((participant) => participant.userId === user.id);
  if (user.role !== Role.ADMIN && !participates) {
    throw new AppError(403, "FORBIDDEN", "You do not have access to this conversation");
  }
  return { conversation, participates };
}

function canSeeCase(caseUserIds: (string | null)[], user: Express.Request["user"]) {
  return Boolean(user && (user.role === Role.ADMIN || caseUserIds.includes(user.id)));
}

apiRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    ok(res, { status: "ok", service: "moussawer-api", version: "v1" });
  })
);

apiRouter.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.enum([Role.CLIENT, Role.PHOTOGRAPHER]).optional(),
        location: z.string().optional(),
        bio: z.string().optional(),
        city: z.string().optional()
      }),
      req.body
    );

    const email = body.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, "EMAIL_EXISTS", "An account with this email already exists");

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: body.name,
        role: body.role ?? Role.CLIENT,
        clientProfile:
          (body.role ?? Role.CLIENT) === Role.CLIENT
            ? {
                create: {
                  location: body.location,
                  bio: body.bio
                }
              }
            : undefined,
        photographerProfile:
          body.role === Role.PHOTOGRAPHER
            ? {
                create: {
                  slug: await uniqueSlug(body.name),
                  bio: body.bio ?? "Available for curated photography sessions.",
                  city: body.city ?? body.location ?? "Toronto",
                  startingPrice: 250
                }
              }
            : undefined
      },
      include: userInclude
    });

    await audit(user.id, "auth.register", "User", user.id);
    created(res, { token: signToken(user.id), user: userResource(user) });
  })
);

apiRouter.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        email: z.string().email(),
        password: z.string().min(1)
      }),
      req.body
    );

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() }, include: userInclude });
    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");

    ok(res, { token: signToken(user.id), user: userResource(user) });
  })
);

apiRouter.post(
  "/auth/logout",
  requireAuth,
  asyncHandler(async (_req, res) => {
    ok(res, { message: "Token discarded on client" });
  })
);

apiRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, userResource(await currentUser(req.user!.id)));
  })
);

apiRouter.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2).optional(),
        avatarUrl: z.string().url().optional().nullable(),
        location: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        phone: z.string().optional().nullable()
      }),
      req.body
    );

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        name: body.name,
        avatarUrl: body.avatarUrl ?? undefined,
        clientProfile:
          req.user!.role === Role.CLIENT
            ? {
                upsert: {
                  create: { location: body.location ?? undefined, bio: body.bio ?? undefined, phone: body.phone ?? undefined },
                  update: { location: body.location ?? undefined, bio: body.bio ?? undefined, phone: body.phone ?? undefined }
                }
              }
            : undefined
      },
      include: userInclude
    });

    await audit(req.user!.id, "user.update_profile", "User", req.user!.id);
    ok(res, userResource(user));
  })
);

apiRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
    ok(res, categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug })));
  })
);

apiRouter.get(
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

apiRouter.get(
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

apiRouter.get(
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

apiRouter.get(
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

apiRouter.get(
  "/me/photographer",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    ok(res, photographerResource(await requirePhotographerProfile(req.user!.id)));
  })
);

apiRouter.patch(
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

apiRouter.get(
  "/me/services",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    ok(res, photographer.services.map(serviceResource));
  })
);

apiRouter.post(
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

apiRouter.patch(
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

apiRouter.get(
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

apiRouter.post(
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

apiRouter.delete(
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

apiRouter.post(
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

apiRouter.get(
  "/bookings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const where: Prisma.BookingWhereInput =
      req.user!.role === Role.ADMIN
        ? {}
        : req.user!.role === Role.CLIENT
          ? { clientId: req.user!.id }
          : { photographer: { userId: req.user!.id } };
    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { startAt: "desc" }
    });
    ok(res, bookings.map(bookingResource));
  })
);

apiRouter.post(
  "/bookings",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        photographerId: z.string(),
        serviceId: z.string(),
        startAt: z.string().datetime({ offset: true }),
        location: z.string().min(3),
        notes: z.string().optional()
      }),
      req.body
    );

    const service = await prisma.photographerService.findFirst({
      where: { id: body.serviceId, photographerId: body.photographerId, isActive: true },
      include: { photographer: { include: { user: true } } }
    });
    if (!service) throw new AppError(404, "NOT_FOUND", "Service not found");

    const startAt = new Date(body.startAt);
    const endAt = addMinutes(startAt, service.durationMinutes);
    await assertBookableSlot(body.photographerId, startAt, endAt);

    const booking = await prisma.booking.create({
      data: {
        clientId: req.user!.id,
        photographerId: body.photographerId,
        serviceId: service.id,
        startAt,
        endAt,
        location: body.location,
        notes: body.notes,
        priceEstimate: service.price
      },
      include: bookingInclude
    });

    const conversation = await prisma.conversation.create({
      data: {
        bookingId: booking.id,
        subject: `Booking request for ${service.title}`,
        participants: {
          create: [{ userId: req.user!.id }, { userId: service.photographer.userId }]
        }
      }
    });

    if (body.notes) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user!.id,
          body: body.notes
        }
      });
    }

    await notify(service.photographer.userId, "booking.requested", "New booking request", `${req.user!.name} requested ${service.title}`, {
      bookingId: booking.id
    });
    await audit(req.user!.id, "booking.create", "Booking", booking.id, { serviceId: service.id });
    created(res, bookingResource(booking));
  })
);

apiRouter.get(
  "/bookings/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, bookingResource(await assertBookingAccess(req.params.id, req.user)));
  })
);

apiRouter.patch(
  "/bookings/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        status: z.nativeEnum(BookingStatus),
        cancellationReason: z.string().optional()
      }),
      req.body
    );
    const booking = await assertBookingAccess(req.params.id, req.user);
    const isClient = booking.clientId === req.user!.id;
    const isPhotographer = booking.photographer.userId === req.user!.id;
    const allowed: Record<BookingStatus, BookingStatus[]> = {
      PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
      CONFIRMED: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
      COMPLETED: [],
      CANCELLED: []
    };

    if (!allowed[booking.status].includes(body.status)) {
      throw new AppError(422, "INVALID_STATUS_TRANSITION", "That booking status transition is not allowed");
    }

    if (req.user!.role === Role.CLIENT && !(isClient && booking.status === BookingStatus.PENDING && body.status === BookingStatus.CANCELLED)) {
      throw new AppError(403, "FORBIDDEN", "Clients can only cancel pending bookings");
    }

    if (req.user!.role === Role.PHOTOGRAPHER && !isPhotographer) {
      throw new AppError(403, "FORBIDDEN", "Photographers can only manage their own bookings");
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: body.status,
        cancellationReason: body.status === BookingStatus.CANCELLED ? body.cancellationReason : undefined,
        confirmedAt: body.status === BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
        completedAt: body.status === BookingStatus.COMPLETED ? new Date() : booking.completedAt,
        cancelledAt: body.status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt
      },
      include: bookingInclude
    });

    const notifyUserId = req.user!.id === updated.clientId ? updated.photographer.userId : updated.clientId;
    await notify(notifyUserId, `booking.${body.status.toLowerCase()}`, "Booking updated", `Booking is now ${body.status.toLowerCase()}`, {
      bookingId: updated.id
    });
    await audit(req.user!.id, "booking.status_update", "Booking", updated.id, { status: body.status });
    ok(res, bookingResource(updated));
  })
);

apiRouter.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const conversations = await prisma.conversation.findMany({
      where: req.user!.role === Role.ADMIN ? {} : { participants: { some: { userId: req.user!.id } } },
      include: {
        participants: { include: { user: { select: { id: true, name: true, role: true, avatarUrl: true } } } },
        messages: {
          include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } },
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    ok(res, conversations.map(conversationResource));
  })
);

apiRouter.post(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        participantId: z.string(),
        subject: z.string().min(3).optional(),
        bookingId: z.string().optional()
      }),
      req.body
    );
    if (body.participantId === req.user!.id) throw new AppError(422, "VALIDATION_ERROR", "Choose another participant");
    const participant = await prisma.user.findUnique({ where: { id: body.participantId } });
    if (!participant || participant.status !== AccountStatus.ACTIVE) throw new AppError(404, "NOT_FOUND", "Participant not found");

    if (body.bookingId) await assertBookingAccess(body.bookingId, req.user);
    const existing = await prisma.conversation.findFirst({
      where: {
        bookingId: body.bookingId ?? null,
        participants: { every: { userId: { in: [req.user!.id, body.participantId] } } }
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, role: true, avatarUrl: true } } } },
        messages: { include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" }, take: 1 }
      }
    });
    if (existing) return ok(res, conversationResource(existing));

    const conversation = await prisma.conversation.create({
      data: {
        subject: body.subject ?? `Conversation with ${participant.name}`,
        bookingId: body.bookingId,
        participants: {
          create: [{ userId: req.user!.id }, { userId: body.participantId }]
        }
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, role: true, avatarUrl: true } } } },
        messages: { include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } }, orderBy: { createdAt: "desc" }, take: 1 }
      }
    });
    created(res, conversationResource(conversation));
  })
);

apiRouter.get(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    await assertConversationAccess(req.params.id, req.user);
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" }
    });
    ok(res, messages.map(messageResource));
  })
);

apiRouter.post(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        body: z.string().min(1),
        attachmentUrl: z.string().url().optional()
      }),
      req.body
    );
    const access = await assertConversationAccess(req.params.id, req.user);
    if (req.user!.role === Role.ADMIN && !access.participates) {
      await prisma.conversationParticipant.create({
        data: { conversationId: req.params.id, userId: req.user!.id }
      });
    }
    const message = await prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: req.user!.id,
        body: body.body,
        attachmentUrl: body.attachmentUrl
      },
      include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } }
    });
    await prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });
    const recipients = await prisma.conversationParticipant.findMany({
      where: { conversationId: req.params.id, userId: { not: req.user!.id } }
    });
    await Promise.all(
      recipients.map((recipient) =>
        notify(recipient.userId, "message.created", "New message", `${req.user!.name} sent you a message`, {
          conversationId: req.params.id
        })
      )
    );
    created(res, messageResource(message));
  })
);

apiRouter.patch(
  "/conversations/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    await assertConversationAccess(req.params.id, req.user);
    const now = new Date();
    await prisma.conversationParticipant.upsert({
      where: { conversationId_userId: { conversationId: req.params.id, userId: req.user!.id } },
      create: { conversationId: req.params.id, userId: req.user!.id, lastReadAt: now },
      update: { lastReadAt: now }
    });
    await prisma.message.updateMany({
      where: { conversationId: req.params.id, senderId: { not: req.user!.id }, readAt: null },
      data: { readAt: now }
    });
    ok(res, { readAt: now });
  })
);

apiRouter.get(
  "/incidents",
  requireAuth,
  asyncHandler(async (req, res) => {
    const incidents = await prisma.incident.findMany({
      where:
        req.user!.role === Role.ADMIN
          ? {}
          : {
              OR: [{ reporterId: req.user!.id }, { targetUserId: req.user!.id }]
            },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    ok(res, incidents.map(incidentResource));
  })
);

apiRouter.post(
  "/incidents",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        targetUserId: z.string().optional(),
        bookingId: z.string().optional(),
        category: z.string().min(3),
        description: z.string().min(10),
        evidenceUrl: z.string().url().optional()
      }),
      req.body
    );
    if (body.bookingId) await assertBookingAccess(body.bookingId, req.user);
    const incident = await prisma.incident.create({
      data: {
        reporterId: req.user!.id,
        targetUserId: body.targetUserId,
        bookingId: body.bookingId,
        category: body.category,
        description: body.description,
        evidenceUrl: body.evidenceUrl
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } }
      }
    });
    await audit(req.user!.id, "incident.create", "Incident", incident.id);
    created(res, incidentResource(incident));
  })
);

apiRouter.patch(
  "/admin/incidents/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        status: z.nativeEnum(IncidentStatus).optional(),
        adminNotes: z.string().optional(),
        resolution: z.string().optional()
      }),
      req.body
    );
    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: body,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } }
      }
    });
    await notify(incident.reporterId, "incident.updated", "Incident updated", `Your incident is now ${incident.status.toLowerCase()}`, {
      incidentId: incident.id
    });
    ok(res, incidentResource(incident));
  })
);

apiRouter.get(
  "/disputes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const disputes = await prisma.dispute.findMany({
      where:
        req.user!.role === Role.ADMIN
          ? {}
          : {
              OR: [{ reporterId: req.user!.id }, { targetUserId: req.user!.id }]
            },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    ok(res, disputes.map(disputeResource));
  })
);

apiRouter.post(
  "/disputes",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        targetUserId: z.string().optional(),
        bookingId: z.string().optional(),
        type: z.string().min(3),
        description: z.string().min(10),
        evidenceUrl: z.string().url().optional()
      }),
      req.body
    );
    if (body.bookingId) await assertBookingAccess(body.bookingId, req.user);
    const dispute = await prisma.dispute.create({
      data: {
        reporterId: req.user!.id,
        targetUserId: body.targetUserId,
        bookingId: body.bookingId,
        type: body.type,
        description: body.description,
        evidenceUrl: body.evidenceUrl
      },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } }
      }
    });
    await audit(req.user!.id, "dispute.create", "Dispute", dispute.id);
    created(res, disputeResource(dispute));
  })
);

apiRouter.get(
  "/disputes/:id/comments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const dispute = await prisma.dispute.findUnique({ where: { id: req.params.id } });
    if (!dispute) throw new AppError(404, "NOT_FOUND", "Dispute not found");
    if (!canSeeCase([dispute.reporterId, dispute.targetUserId], req.user)) throw new AppError(403, "FORBIDDEN", "You do not have access to this dispute");
    const comments = await prisma.disputeComment.findMany({ where: { disputeId: dispute.id }, orderBy: { createdAt: "asc" } });
    ok(res, comments);
  })
);

apiRouter.post(
  "/disputes/:id/comments",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        body: z.string().min(2),
        evidenceUrl: z.string().url().optional()
      }),
      req.body
    );
    const dispute = await prisma.dispute.findUnique({ where: { id: req.params.id } });
    if (!dispute) throw new AppError(404, "NOT_FOUND", "Dispute not found");
    if (!canSeeCase([dispute.reporterId, dispute.targetUserId], req.user)) throw new AppError(403, "FORBIDDEN", "You do not have access to this dispute");
    const comment = await prisma.disputeComment.create({
      data: {
        disputeId: dispute.id,
        authorId: req.user!.id,
        body: body.body,
        evidenceUrl: body.evidenceUrl
      }
    });
    created(res, comment);
  })
);

apiRouter.patch(
  "/admin/disputes/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        status: z.nativeEnum(DisputeStatus).optional(),
        adminNotes: z.string().optional(),
        resolution: z.string().optional()
      }),
      req.body
    );
    const dispute = await prisma.dispute.update({
      where: { id: req.params.id },
      data: body,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        targetUser: { select: { id: true, name: true, email: true } }
      }
    });
    await notify(dispute.reporterId, "dispute.updated", "Dispute updated", `Your dispute is now ${dispute.status.toLowerCase()}`, {
      disputeId: dispute.id
    });
    ok(res, disputeResource(dispute));
  })
);

apiRouter.get(
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

apiRouter.post(
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

apiRouter.patch(
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

apiRouter.delete(
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

apiRouter.post(
  "/reviews",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        bookingId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional()
      }),
      req.body
    );
    const booking = await prisma.booking.findUnique({ where: { id: body.bookingId }, include: bookingInclude });
    if (!booking) throw new AppError(404, "NOT_FOUND", "Booking not found");
    if (booking.clientId !== req.user!.id) throw new AppError(403, "FORBIDDEN", "You can only review your own bookings");
    if (booking.status !== BookingStatus.COMPLETED) throw new AppError(422, "VALIDATION_ERROR", "Only completed bookings can be reviewed");

    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        clientId: req.user!.id,
        photographerId: booking.photographerId,
        rating: body.rating,
        comment: body.comment
      },
      include: { client: { select: { id: true, name: true, avatarUrl: true } } }
    });

    const aggregate = await prisma.review.aggregate({
      where: { photographerId: booking.photographerId, isModerated: false },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await prisma.photographerProfile.update({
      where: { id: booking.photographerId },
      data: {
        rating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count.rating
      }
    });
    await notify(booking.photographer.userId, "review.created", "New review received", `${req.user!.name} reviewed your session`, {
      reviewId: review.id
    });
    created(res, reviewResource(review));
  })
);

apiRouter.get(
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

apiRouter.post(
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

apiRouter.delete(
  "/favorites/:photographerId",
  requireAuth,
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    await prisma.favorite.deleteMany({ where: { userId: req.user!.id, photographerId: req.params.photographerId } });
    noContent(res);
  })
);

apiRouter.get(
  "/notifications",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    ok(res, notifications.map(notificationResource));
  })
);

apiRouter.patch(
  "/notifications/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notification = await prisma.notification.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!notification) throw new AppError(404, "NOT_FOUND", "Notification not found");
    const updated = await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
    ok(res, notificationResource(updated));
  })
);

apiRouter.post(
  "/support",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(3),
        message: z.string().min(10)
      }),
      req.body
    );
    const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
    await Promise.all(
      admins.map((admin) =>
        notify(admin.id, "support.request", body.subject, `${body.name} (${body.email}) wrote: ${body.message.slice(0, 160)}`)
      )
    );
    created(res, { message: "Support request received" });
  })
);

apiRouter.get(
  "/admin/stats",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const [
      totalUsers,
      totalPhotographers,
      totalClients,
      totalBookings,
      pendingBookings,
      openIncidents,
      openDisputes,
      messages,
      moderatedPortfolio
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: Role.PHOTOGRAPHER } }),
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.incident.count({ where: { status: { in: [IncidentStatus.OPEN, IncidentStatus.UNDER_REVIEW] } } }),
      prisma.dispute.count({ where: { status: { in: [DisputeStatus.OPEN, DisputeStatus.AWAITING_RESPONSE, DisputeStatus.UNDER_REVIEW] } } }),
      prisma.message.count(),
      prisma.portfolioItem.count({ where: { isModerated: true } })
    ]);

    ok(res, {
      totalUsers,
      totalPhotographers,
      totalClients,
      totalBookings,
      pendingBookings,
      openIncidents,
      openDisputes,
      recentMessages: messages,
      moderationQueue: moderatedPortfolio
    });
  })
);

apiRouter.get(
  "/admin/users",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const users = await prisma.user.findMany({ include: userInclude, orderBy: { createdAt: "desc" } });
    ok(res, users.map(userResource));
  })
);

apiRouter.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        status: z.nativeEnum(AccountStatus).optional(),
        role: z.nativeEnum(Role).optional()
      }),
      req.body
    );
    const user = await prisma.user.update({ where: { id: req.params.id }, data: body, include: userInclude });
    await audit(req.user!.id, "admin.user_update", "User", user.id, body);
    ok(res, userResource(user));
  })
);

apiRouter.post(
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

apiRouter.get(
  "/admin/activity",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const logs = await prisma.activityLog.findMany({
      include: { actor: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 80
    });
    ok(res, logs.map((log) => ({ ...log, metadata: JSON.parse(log.metadata) })));
  })
);
