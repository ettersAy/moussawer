import { Router } from "express";
import { Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { AppError, asyncHandler, ok, validate } from "../../utils/http";
import { requirePhotographerProfile } from "../helpers";
import { decrypt } from "../../services/encryption";
import {
  getAuthUrl,
  exchangeCode,
  refreshAccessToken,
  listUpcomingEvents,
  revokeToken
} from "../../services/google-calendar";
import { upsertGoogleEvents } from "../../services/calendar-sync-helpers";

const STATE_MAX_AGE_MS = 10 * 60 * 1000;

export const router = Router();

router.get(
  "/me/calendar-sync/auth-url",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (_req, res) => {
    const url = getAuthUrl(_req.user!.id);
    ok(res, { url });
  })
);

router.get(
  "/me/calendar-sync/callback",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const code = typeof req.query.code === "string" ? req.query.code : null;
    if (!code) throw new AppError(400, "MISSING_CODE", "Authorization code is required");

    // Validate state parameter for CSRF protection
    if (typeof req.query.state === "string") {
      try {
        const decoded = JSON.parse(decrypt(req.query.state));
        if (decoded.userId !== req.user!.id) {
          throw new AppError(403, "STATE_MISMATCH", "State parameter does not match user");
        }
        if (Date.now() - decoded.ts > STATE_MAX_AGE_MS) {
          throw new AppError(400, "STATE_EXPIRED", "Authorization flow expired, please try again");
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(400, "INVALID_STATE", "Invalid state parameter");
      }
    }

    const photographer = await requirePhotographerProfile(req.user!.id);
    const { refreshToken, calendarId } = await exchangeCode(code);
    const accessToken = await refreshAccessToken(refreshToken);
    const { events, nextSyncToken } = await listUpcomingEvents(accessToken, calendarId);
    await upsertGoogleEvents(photographer.id, events);

    await prisma.photographerProfile.update({
      where: { id: photographer.id },
      data: {
        googleCalendarEnabled: true,
        googleRefreshToken: refreshToken,
        googleCalendarId: calendarId,
        googleSyncToken: nextSyncToken
      }
    });

    res.send(
      `<!DOCTYPE html><html><head><title>Google Calendar Connected</title><style>body{font-family:-apple-system,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;color:#333}h2{color:#4caf50}</style></head><body><div><h2>Google Calendar Connected</h2><p>${events.length} event${events.length !== 1 ? "s" : ""} imported. You can close this window.</p></div><script>window.close()</script></body></html>`
    );
  })
);

router.post(
  "/me/calendar-sync/callback",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    const body = validate(z.object({ code: z.string().min(1) }), req.body);
    const { refreshToken, calendarId } = await exchangeCode(body.code);
    const accessToken = await refreshAccessToken(refreshToken);
    const { events, nextSyncToken } = await listUpcomingEvents(accessToken, calendarId);
    await upsertGoogleEvents(photographer.id, events);

    await prisma.photographerProfile.update({
      where: { id: photographer.id },
      data: {
        googleCalendarEnabled: true,
        googleRefreshToken: refreshToken,
        googleCalendarId: calendarId,
        googleSyncToken: nextSyncToken
      }
    });

    ok(res, { imported: events.length });
  })
);

router.post(
  "/me/calendar-sync/sync",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    if (!photographer.googleRefreshToken || !photographer.googleCalendarId) {
      throw new AppError(400, "NOT_CONNECTED", "Google Calendar is not connected");
    }

    const accessToken = await refreshAccessToken(photographer.googleRefreshToken);
    const { events, nextSyncToken } = await listUpcomingEvents(
      accessToken,
      photographer.googleCalendarId,
      photographer.googleSyncToken
    );

    await upsertGoogleEvents(photographer.id, events);

    await prisma.photographerProfile.update({
      where: { id: photographer.id },
      data: { googleSyncToken: nextSyncToken }
    });

    ok(res, { imported: events.length });
  })
);

router.delete(
  "/me/calendar-sync",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);
    if (!photographer.googleRefreshToken) {
      throw new AppError(400, "NOT_CONNECTED", "Google Calendar is not connected");
    }

    await revokeToken(photographer.googleRefreshToken).catch(() => {});

    const deleted = await prisma.calendarBlock.deleteMany({
      where: { photographerId: photographer.id, source: "google_calendar" }
    });

    await prisma.photographerProfile.update({
      where: { id: photographer.id },
      data: {
        googleCalendarEnabled: false,
        googleRefreshToken: null,
        googleCalendarId: null,
        googleSyncToken: null
      }
    });

    ok(res, { removedBlocks: deleted.count });
  })
);

router.get(
  "/me/calendar-sync/status",
  requireAuth,
  requireRole(Role.PHOTOGRAPHER),
  asyncHandler(async (req, res) => {
    const photographer = await requirePhotographerProfile(req.user!.id);

    const count = await prisma.calendarBlock.count({
      where: { photographerId: photographer.id, source: "google_calendar" }
    });

    ok(res, {
      connected: photographer.googleCalendarEnabled,
      calendarId: photographer.googleCalendarId,
      importedBlockCount: count
    });
  })
);
