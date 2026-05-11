import type { Booking, PhotographerProfile, PhotographerService, User } from "@prisma/client";

export function bookingResource(
  booking: Booking & {
    client?: Pick<User, "id" | "name" | "email" | "avatarUrl">;
    photographer?: PhotographerProfile & { user: Pick<User, "id" | "name" | "email" | "avatarUrl"> };
    service?: PhotographerService;
    conversations?: { id: string }[];
  }
) {
  return {
    id: booking.id,
    client: booking.client
      ? { id: booking.client.id, name: booking.client.name, email: booking.client.email, avatarUrl: booking.client.avatarUrl }
      : { id: booking.clientId },
    photographer: booking.photographer
      ? {
          id: booking.photographer.id,
          name: booking.photographer.user.name,
          slug: booking.photographer.slug,
          email: booking.photographer.user.email,
          avatarUrl: booking.photographer.user.avatarUrl
        }
      : { id: booking.photographerId },
    service: booking.service
      ? {
          id: booking.service.id,
          title: booking.service.title,
          durationMinutes: booking.service.durationMinutes,
          price: booking.service.price
        }
      : { id: booking.serviceId },
    conversation: booking.conversations?.[0] ? { id: booking.conversations[0].id } : undefined,
    startAt: booking.startAt,
    endAt: booking.endAt,
    location: booking.location,
    notes: booking.notes,
    status: booking.status,
    priceEstimate: booking.priceEstimate,
    cancellationReason: booking.cancellationReason,
    confirmedAt: booking.confirmedAt,
    cancelledAt: booking.cancelledAt,
    completedAt: booking.completedAt,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}
