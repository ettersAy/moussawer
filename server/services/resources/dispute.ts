import type { Dispute, User } from "@prisma/client";

export function disputeResource(dispute: Dispute & { reporter?: Pick<User, "id" | "name" | "email">; targetUser?: Pick<User, "id" | "name" | "email"> | null }) {
  return {
    id: dispute.id,
    reporter: dispute.reporter ? { id: dispute.reporter.id, name: dispute.reporter.name, email: dispute.reporter.email } : { id: dispute.reporterId },
    targetUser: dispute.targetUser ? { id: dispute.targetUser.id, name: dispute.targetUser.name, email: dispute.targetUser.email } : null,
    bookingId: dispute.bookingId,
    type: dispute.type,
    description: dispute.description,
    evidenceUrl: dispute.evidenceUrl,
    status: dispute.status,
    adminNotes: dispute.adminNotes,
    resolution: dispute.resolution,
    createdAt: dispute.createdAt,
    updatedAt: dispute.updatedAt
  };
}
