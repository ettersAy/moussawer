import type { Category } from "./category";

export type Service = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  price: number;
  isActive?: boolean;
  category?: Category | null;
};

export type PortfolioItem = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  tags: string[];
  isFeatured: boolean;
  isModerated: boolean;
  sortOrder?: number;
  category?: Category | null;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  client: { id: string; name?: string; avatarUrl?: string | null };
  createdAt: string;
};

export type Photographer = {
  id: string;
  userId: string;
  slug: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  bio: string;
  city: string;
  country: string;
  profileImageUrl?: string | null;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  timezone: string;
  isPublished: boolean;
  verified: boolean;
  googleCalendarEnabled: boolean;
  categories: Category[];
  services: Service[];
  portfolioItems: PortfolioItem[];
  reviews: Review[];
};
