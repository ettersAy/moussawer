import type { Category, PhotographerProfile, PhotographerService, PortfolioItem, Review, User } from "@prisma/client";
import { serviceResource } from "./service";
import { portfolioResource } from "./portfolio";
import { reviewResource } from "./review";

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
    rating: photographer.rating != null ? Number(Number(photographer.rating).toFixed(1)) : 0,
    reviewCount: photographer.reviewCount,
    popularity: photographer.popularity,
    timezone: photographer.timezone,
    isPublished: photographer.isPublished,
    verified: photographer.verified,
    googleCalendarEnabled: photographer.googleCalendarEnabled,
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
