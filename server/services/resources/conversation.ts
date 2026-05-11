import type { Conversation, Message, User } from "@prisma/client";
import { messageResource } from "./message";

export function conversationResource(
  conversation: Conversation & {
    participants?: { user: Pick<User, "id" | "name" | "role" | "avatarUrl">; lastReadAt: Date | null }[];
    messages?: (Message & { sender?: Pick<User, "id" | "name" | "role" | "avatarUrl"> })[];
  }
) {
  return {
    id: conversation.id,
    subject: conversation.subject,
    bookingId: conversation.bookingId,
    disputeId: conversation.disputeId,
    incidentId: conversation.incidentId,
    participants: conversation.participants?.map((participant) => ({
      user: participant.user,
      lastReadAt: participant.lastReadAt
    })) ?? [],
    lastMessage: conversation.messages?.[0] ? messageResource(conversation.messages[0]) : null,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt
  };
}
