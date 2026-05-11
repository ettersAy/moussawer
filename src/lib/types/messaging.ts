import type { User } from "./user";

export type Message = {
  id: string;
  conversationId: string;
  sender: Pick<User, "id" | "name" | "role" | "avatarUrl">;
  body: string;
  attachmentUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  subject: string;
  bookingId?: string | null;
  participants: { user: Pick<User, "id" | "name" | "role" | "avatarUrl">; lastReadAt?: string | null }[];
  lastMessage?: Message | null;
};
