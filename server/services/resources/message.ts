import type { Message, User } from "@prisma/client";

export function messageResource(message: Message & { sender?: Pick<User, "id" | "name" | "role" | "avatarUrl"> }) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    sender: message.sender
      ? { id: message.sender.id, name: message.sender.name, role: message.sender.role, avatarUrl: message.sender.avatarUrl }
      : { id: message.senderId },
    body: message.body,
    attachmentUrl: message.attachmentUrl,
    readAt: message.readAt,
    createdAt: message.createdAt
  };
}
