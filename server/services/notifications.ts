import { prisma } from "../db";

export async function notify(userId: string, type: string, title: string, body: string, metadata: Record<string, unknown> = {}) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      metadata: JSON.stringify(metadata)
    }
  });
}

export async function audit(actorId: string | undefined, action: string, entity: string, entityId: string, metadata: Record<string, unknown> = {}) {
  return prisma.activityLog.create({
    data: {
      actorId,
      action,
      entity,
      entityId,
      metadata: JSON.stringify(metadata)
    }
  });
}
