import { Router } from "express";
import { AccountStatus, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { notify } from "../services/notifications";
import { conversationResource, messageResource } from "../services/resources";
import { AppError, asyncHandler, created, ok, pagination, validate } from "../utils/http";
import { assertBookingAccess, assertConversationAccess } from "./helpers";

export const router = Router();

router.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const where = req.user!.role === Role.ADMIN ? {} : { participants: { some: { userId: req.user!.id } } };
    const { page, limit, skip } = pagination(req.query);
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        include: {
          participants: { include: { user: { select: { id: true, name: true, role: true, avatarUrl: true } } } },
          messages: {
            include: { sender: { select: { id: true, name: true, role: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
            take: 1
          }
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit
      }),
      prisma.conversation.count({ where })
    ]);
    ok(res, conversations.map(conversationResource), { page, limit, total });
  })
);

router.post(
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

router.get(
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

router.post(
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

router.patch(
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
