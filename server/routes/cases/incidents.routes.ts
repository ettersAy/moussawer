import { Router } from "express";
import { IncidentStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db";
import { requireAuth, requireRole } from "../../middleware/auth";
import { audit, notify } from "../../services/notifications";
import { incidentResource } from "../../services/resources";
import { asyncHandler, created, ok, validate } from "../../utils/http";
import { assertBookingAccess } from "../helpers";

export const router = Router();

router.get(
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

router.post(
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

router.patch(
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
