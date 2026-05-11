import type { Notification } from "@prisma/client";

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

export function notificationResource(notification: Notification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    readAt: notification.readAt,
    metadata: safeJson(notification.metadata),
    createdAt: notification.createdAt
  };
}
