import { Role } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../utils/http";
import { bookingInclude, photographerInclude, userInclude } from "./includes";

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uniqueSlug(name: string) {
  const base = slugify(name) || "photographer";
  let slug = base;
  let counter = 1;
  while (await prisma.photographerProfile.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }
  return slug;
}

export async function currentUser(id: string) {
  const user = await prisma.user.findUnique({ where: { id }, include: userInclude });
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Authentication is required");
  return user;
}

export async function requirePhotographerProfile(userId: string) {
  const photographer = await prisma.photographerProfile.findUnique({
    where: { userId },
    include: photographerInclude
  });
  if (!photographer) throw new AppError(403, "FORBIDDEN", "A photographer profile is required");
  return photographer;
}

export async function resolvePhotographer(identifier: string) {
  const photographer = await prisma.photographerProfile.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }]
    },
    include: photographerInclude
  });
  if (!photographer || !photographer.isPublished) throw new AppError(404, "NOT_FOUND", "Photographer not found");
  return photographer;
}

export async function assertBookingAccess(bookingId: string, user: Express.Request["user"]) {
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

export async function assertConversationAccess(conversationId: string, user: Express.Request["user"]) {
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

export function canSeeCase(caseUserIds: (string | null)[], user: Express.Request["user"]) {
  return Boolean(user && (user.role === Role.ADMIN || caseUserIds.includes(user.id)));
}
