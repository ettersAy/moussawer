/**
 * RESOURCE SERIALIZERS — Layer 2 of the Route → Include → Resource chain.
 *
 * DEPENDENCY CHAIN:
 *   Route Handler (server/routes/*.ts)
 *     └─ queries via Prisma include from server/routes/includes.ts
 *          └─ serializes result using a resource function from this file
 *
 * Each resource function:
 * - Takes a Prisma model instance (with relations matching the corresponding include)
 * - Returns a plain JSON-safe object (no Date, Decimal, or circular refs)
 * - Uses ?? fallbacks for optional fields
 *
 * CRITICAL: If you expand a resource function's return object, you MUST also:
 * 1. Update the corresponding include in server/routes/includes.ts to fetch the new field/relation
 * 2. Update the input type annotation in this function
 * 3. Update all callers — run `./scripts/audit-resource-callers.sh` to find them
 *
 * | Resource function | Corresponding include | Used by routes |
 * |-------------------|----------------------|----------------|
 * | userResource | userInclude | admin, auth |
 * | serviceResource | (none, inline includes) | photographer |
 * | portfolioResource | (none, inline includes) | portfolio |
 * | photographerResource | photographerInclude | discovery, favorites, photographer |
 * | bookingResource | bookingInclude | admin, bookings |
 * | messageResource | (none, inline includes) | messaging |
 * | conversationResource | (none, inline includes) | messaging |
 * | incidentResource | (none, inline includes) | cases |
 * | disputeResource | (none, inline includes) | cases |
 * | reviewResource | (none, inline includes) | discovery, reviews |
 * | notificationResource | (none) | notifications |
 * | blockResource | (none) | photographer |
 */
import type {
  Booking,
  CalendarBlock,
  Category,
  ClientProfile,
  Conversation,
  Dispute,
  Incident,
  Message,
  Notification,
  PhotographerProfile,
  PhotographerService,
  PortfolioItem,
  Review,
  User
} from "@prisma/client";

type PhotographerProfileShape = {
  id: string; slug: string; verified?: boolean; isPublished?: boolean;
  city?: string; country?: string; startingPrice?: number; rating?: number;
};

type UserShape = Pick<User, "id" | "email" | "name" | "role" | "status" | "avatarUrl" | "createdAt" | "updatedAt">;

export function userResource(user: UserShape & { clientProfile?: ClientProfile | null; photographerProfile?: PhotographerProfileShape | null }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl,
    clientProfile: user.clientProfile
      ? {
          location: user.clientProfile.location,
          bio: user.clientProfile.bio,
          phone: user.clientProfile.phone
        }
      : null,
    photographerProfile: user.photographerProfile
      ? {
          id: user.photographerProfile.id,
          slug: user.photographerProfile.slug,
          verified: user.photographerProfile.verified ?? false,
          isPublished: user.photographerProfile.isPublished ?? false,
          city: user.photographerProfile.city ?? "",
          country: user.photographerProfile.country ?? "",
          startingPrice: user.photographerProfile.startingPrice ?? 0,
          rating: user.photographerProfile.rating != null ? Number(Number(user.photographerProfile.rating).toFixed(1)) : 0
        }
      : null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export function serviceResource(service: PhotographerService & { category?: Category | null }) {
  return {
    id: service.id,
    title: service.title,
    description: service.description,
    durationMinutes: service.durationMinutes,
    price: service.price,
    isActive: service.isActive,
    category: service.category ? { id: service.category.id, name: service.category.name, slug: service.category.slug } : null
  };
}

export function portfolioResource(item: PortfolioItem & { category?: Category | null }) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    tags: item.tags ? item.tags.split(",").filter(Boolean) : [],
    isFeatured: item.isFeatured,
    sortOrder: item.sortOrder,
    isModerated: item.isModerated,
    category: item.category ? { id: item.category.id, name: item.category.name, slug: item.category.slug } : null,
    createdAt: item.createdAt
  };
}

export function photographerResource(
  photographer: PhotographerProfile & {
    user: Pick<User, "id" | "name" | "email" | "avatarUrl">;
    categories?: { category: Category }[];
    services?: (PhotographerService & { category?: Category | null })[];
    portfolioItems?: (PortfolioItem & { category?: Category | null })[];
    reviews?: (Review & { client: Pick<User, "id" | "name" | "avatarUrl"> })[];
  }
) {
  return {
    id: photographer.id,
    userId: photographer.userId,
    slug: photographer.slug,
    name: photographer.user.name,
    email: photographer.user.email,
    avatarUrl: photographer.user.avatarUrl,
    bio: photographer.bio,
    city: photographer.city,
    country: photographer.country,
    profileImageUrl: photographer.profileImageUrl,
    startingPrice: photographer.startingPrice,
    rating: Number(photographer.rating.toFixed(1)),
    reviewCount: photographer.reviewCount,
    popularity: photographer.popularity,
    timezone: photographer.timezone,
    isPublished: photographer.isPublished,
    verified: photographer.verified,
    categories: photographer.categories?.map(({ category }) => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    })) ?? [],
    services: photographer.services?.map(serviceResource) ?? [],
    portfolioItems: photographer.portfolioItems?.map(portfolioResource) ?? [],
    reviews: photographer.reviews?.map(reviewResource) ?? [],
    createdAt: photographer.createdAt
  };
}

export function bookingResource(
  booking: Booking & {
    client?: Pick<User, "id" | "name" | "email" | "avatarUrl">;
    photographer?: PhotographerProfile & { user: Pick<User, "id" | "name" | "email" | "avatarUrl"> };
    service?: PhotographerService;
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

export function blockResource(block: CalendarBlock) {
  return {
    id: block.id,
    photographerId: block.photographerId,
    startAt: block.startAt,
    endAt: block.endAt,
    reason: block.reason,
    createdAt: block.createdAt
  };
}

function safeJson(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}
