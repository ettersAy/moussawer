import type { Incident, User } from "@prisma/client";

export function incidentResource(incident: Incident & { reporter?: Pick<User, "id" | "name" | "email">; targetUser?: Pick<User, "id" | "name" | "email"> | null }) {
  return {
    id: incident.id,
    reporter: incident.reporter ? { id: incident.reporter.id, name: incident.reporter.name, email: incident.reporter.email } : { id: incident.reporterId },
    targetUser: incident.targetUser ? { id: incident.targetUser.id, name: incident.targetUser.name, email: incident.targetUser.email } : null,
    bookingId: incident.bookingId,
    category: incident.category,
    description: incident.description,
    evidenceUrl: incident.evidenceUrl,
    status: incident.status,
    adminNotes: incident.adminNotes,
    resolution: incident.resolution,
    createdAt: incident.createdAt,
    updatedAt: incident.updatedAt
  };
}
