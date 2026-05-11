import type { ClientProfile, User } from "@prisma/client";

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
