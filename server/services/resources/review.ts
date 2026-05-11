import type { Review, User } from "@prisma/client";

export function reviewResource(review: Review & { client?: Pick<User, "id" | "name" | "avatarUrl"> }) {
  return {
    id: review.id,
    bookingId: review.bookingId,
    rating: review.rating,
    comment: review.comment,
    client: review.client ? { id: review.client.id, name: review.client.name, avatarUrl: review.client.avatarUrl } : { id: review.clientId },
    createdAt: review.createdAt
  };
}
