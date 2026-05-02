import { Router } from "express";
import { DisputeStatus, IncidentStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { audit, notify } from "../services/notifications";
import { disputeResource, incidentResource } from "../services/resources";
import { AppError, asyncHandler, created, ok, validate } from "../utils/http";
import { assertBookingAccess, canSeeCase } from "./helpers";

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

router.get(
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

router.post(
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

router.get(
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

router.post(
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

router.patch(
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
