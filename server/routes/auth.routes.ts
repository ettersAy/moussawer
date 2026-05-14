import { Router } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { AccountStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { optionalAuth, requireAuth, signToken } from "../middleware/auth";
import { audit } from "../services/notifications";
import { userResource } from "../services/resources";
import { AppError, asyncHandler, created, ok, validate } from "../utils/http";
import { config } from "../config";
import { currentUser, uniqueSlug } from "./helpers";

const googleClient = new OAuth2Client(config.google.clientId);

export const router = Router();

router.post(
  "/auth/register",
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
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

    const matches = await bcrypt.compare(body.password, user.passwordHash ?? "");
    if (!matches) throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");

    ok(res, { token: signToken(user.id), user: userResource(user) });
  })
);

router.post(
  "/auth/google",
  asyncHandler(async (req, res) => {
    const body = validate(
      z.object({ credential: z.string().min(1) }),
      req.body
    );

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: body.credential,
        audience: config.google.clientId
      });
      payload = ticket.getPayload();
    } catch {
      throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Google authentication failed");
    }

    if (!payload?.email || !payload.sub || !payload.email_verified) {
      throw new AppError(401, "INVALID_GOOGLE_TOKEN", "Google account not verified");
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;
    const name = payload.name ?? email.split("@")[0];

    // Find existing user by googleId or email
    let user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
        include: { clientProfile: true, photographerProfile: { select: { id: true, slug: true } } }
      });
      if (user) {
        // Link Google account to existing email/password user
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
          include: { clientProfile: true, photographerProfile: { select: { id: true, slug: true } } }
        });
      }
    }

    if (!user) {
      // Create new Google user
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name,
          role: Role.CLIENT,
          clientProfile: { create: {} }
        },
        include: { clientProfile: true, photographerProfile: { select: { id: true, slug: true } } }
      });
      await audit(user.id, "auth.google_register", "User", user.id);
    }

    await audit(user.id, "auth.google_login", "User", user.id);
    created(res, { token: signToken(user.id), user: userResource(user) });
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
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) return ok(res, null);
    ok(res, userResource(await currentUser(req.user.id)));
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
