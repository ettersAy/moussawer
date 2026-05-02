import { Router } from "express";
import bcrypt from "bcryptjs";
import { AccountStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, signToken } from "../middleware/auth";
import { audit } from "../services/notifications";
import { userResource } from "../services/resources";
import { AppError, asyncHandler, created, ok, validate } from "../utils/http";
import { currentUser, uniqueSlug } from "./helpers";

export const router = Router();

router.post(
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
      include: { clientProfile: true, photographerProfile: { select: { id: true, slug: true } } }
    });

    await audit(user.id, "auth.register", "User", user.id);
    created(res, { token: signToken(user.id), user: userResource(user) });
  })
);

router.post(
  "/auth/login",
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        email: z.string().email(),
        password: z.string().min(1)
      }),
      req.body
    );

    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { clientProfile: true, photographerProfile: { select: { id: true, slug: true } } }
    });
    if (!user || user.status !== AccountStatus.ACTIVE) {
      throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");

    ok(res, { token: signToken(user.id), user: userResource(user) });
  })
);

router.post(
  "/auth/logout",
  requireAuth,
  asyncHandler(async (_req, res) => {
    ok(res, { message: "Token discarded on client" });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    ok(res, userResource(await currentUser(req.user!.id)));
  })
);

router.patch(
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
      include: { clientProfile: true, photographerProfile: { select: { id: true, slug: true } } }
    });

    await audit(req.user!.id, "user.update_profile", "User", req.user!.id);
    ok(res, userResource(user));
  })
);
