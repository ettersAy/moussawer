import { Router } from "express";
import bcrypt from "bcryptjs";
import {
  AccountStatus, BookingStatus, DisputeStatus, IncidentStatus, Role
} from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { audit } from "../services/notifications";
import { bookingResource, userResource } from "../services/resources";
import { AppError, asyncHandler, created, noContent, ok, pagination, safeJson, validate } from "../utils/http";
import { slugify, uniqueSlug } from "./helpers";
import { bookingInclude, userInclude } from "./includes";

export const router = Router();

router.get(
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

router.get(
  "/admin/users",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const role = typeof req.query.role === "string" && Object.values(Role).includes(req.query.role as Role) ? req.query.role as Role : undefined;
    const status = typeof req.query.status === "string" && Object.values(AccountStatus).includes(req.query.status as AccountStatus) ? req.query.status as AccountStatus : undefined;

    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 25), 1), 100);
    const skip = (page - 1) * limit;

    const sortBy = typeof req.query.sortBy === "string" ? req.query.sortBy : "createdAt";
    const sortOrder = typeof req.query.sortOrder === "string" && req.query.sortOrder.toLowerCase() === "asc" ? "asc" as const : "desc" as const;

    const allowedSortFields = ["name", "email", "role", "status", "createdAt", "updatedAt"];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (role) where.role = role;
    if (status) where.status = status;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: { [orderField]: sortOrder },
        skip,
        take: limit
      })
    ]);

    const totalPages = Math.ceil(total / limit);
    ok(res, users.map(userResource), { page, limit, total, totalPages });
  })
);

router.post(
  "/admin/users",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
        role: z.nativeEnum(Role),
        avatarUrl: z.string().url().optional().nullable(),
        // Client profile fields
        location: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        // Photographer profile fields
        city: z.string().optional(),
        startingPrice: z.number().int().positive().optional()
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
        role: body.role,
        avatarUrl: body.avatarUrl ?? undefined,
        clientProfile:
          body.role === Role.CLIENT
            ? {
                create: {
                  location: body.location ?? undefined,
                  bio: body.bio ?? undefined,
                  phone: body.phone ?? undefined
                }
              }
            : undefined,
        photographerProfile:
          body.role === Role.PHOTOGRAPHER
            ? {
                create: {
                  slug: await uniqueSlug(body.name),
                  bio: body.bio ?? "Available for curated photography sessions.",
                  city: body.city ?? "Toronto",
                  startingPrice: body.startingPrice ?? 250
                }
              }
            : undefined
      },
      include: userInclude
    });

    await audit(req.user!.id, "admin.user_create", "User", user.id, {
      name: body.name, email: body.email, role: body.role
    });
    created(res, userResource(user));
  })
);

router.patch(
  "/admin/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        avatarUrl: z.string().url().optional().nullable(),
        status: z.nativeEnum(AccountStatus).optional(),
        role: z.nativeEnum(Role).optional(),
        verified: z.boolean().optional(),
        // Client profile fields
        location: z.string().optional().nullable(),
        bio: z.string().optional().nullable(),
        phone: z.string().optional().nullable(),
        // Photographer profile fields
        city: z.string().optional(),
        country: z.string().optional(),
        startingPrice: z.number().int().positive().optional(),
        isPublished: z.boolean().optional(),
        slug: z.string().optional()
      }),
      req.body
    );

    const {
      verified, location, bio, phone,
      city, country, startingPrice, isPublished, slug,
      ...userData
    } = body;

    // Handle photographer profile updates
    const ppFields: Record<string, unknown> = {};
    if (verified !== undefined) ppFields.verified = verified;
    if (city !== undefined) ppFields.city = city;
    if (country !== undefined) ppFields.country = country;
    if (startingPrice !== undefined) ppFields.startingPrice = startingPrice;
    if (isPublished !== undefined) ppFields.isPublished = isPublished;
    if (slug !== undefined) ppFields.slug = slug;
    if (bio !== undefined) ppFields.bio = bio;

    if (Object.keys(ppFields).length > 0) {
      const pp = await prisma.photographerProfile.findUnique({ where: { userId: req.params.id } });
      if (pp) {
        await prisma.photographerProfile.update({
          where: { userId: req.params.id },
          data: ppFields
        });
      }
    }

    // Handle client profile updates
    const cpFields: Record<string, unknown> = {};
    if (location !== undefined) cpFields.location = location;
    if (bio !== undefined) cpFields.bio = bio;
    if (phone !== undefined) cpFields.phone = phone;

    if (Object.keys(cpFields).length > 0) {
      const cp = await prisma.clientProfile.findUnique({ where: { userId: req.params.id } });
      if (cp) {
        await prisma.clientProfile.update({
          where: { userId: req.params.id },
          data: cpFields
        });
      } else if (body.role === Role.CLIENT || !body.role) {
        // Create client profile if it doesn't exist and user is/is becoming a client
        await prisma.clientProfile.create({
          data: { userId: req.params.id, ...cpFields } as any
        });
      }
    }

    // Handle email uniqueness check
    if (userData.email) {
      userData.email = userData.email.toLowerCase();
      const existing = await prisma.user.findFirst({
        where: { email: userData.email, id: { not: req.params.id } }
      });
      if (existing) throw new AppError(409, "EMAIL_EXISTS", "Email already in use by another user");
    }

    const updateData = Object.keys(userData).length > 0 ? userData : {};
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
      include: userInclude
    });
    await audit(req.user!.id, "admin.user_update", "User", user.id, { ...body });
    ok(res, userResource(user));
  })
);

router.delete(
  "/admin/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser) throw new AppError(404, "NOT_FOUND", "User not found");
    if (targetUser.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) throw new AppError(409, "LAST_ADMIN", "Cannot delete the last admin account");
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    await audit(req.user!.id, "admin.user_delete", "User", targetUser.id, { name: targetUser.name, email: targetUser.email });
    noContent(res);
  })
);

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
  "/admin/bookings",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const where: Prisma.BookingWhereInput = status ? { status: status as BookingStatus } : {};
    const bookings = await prisma.booking.findMany({
      where,
      include: bookingInclude,
      orderBy: { createdAt: "desc" },
      take: 100
    });
    ok(res, bookings.map(bookingResource));
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

router.get(
  "/admin/activity",
  requireAuth,
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = pagination(req.query);
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        include: { actor: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      prisma.activityLog.count()
    ]);
    ok(res, logs.map((log) => ({ ...log, metadata: safeJson(log.metadata) })), { page, limit, total });
  })
);
