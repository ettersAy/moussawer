export type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CLIENT" | "PHOTOGRAPHER";
  status: string;
  avatarUrl?: string | null;
  photographerProfile?: {
    id: string;
    slug: string;
    verified?: boolean;
    isPublished?: boolean;
    city?: string;
    country?: string;
    startingPrice?: number;
    rating?: number;
  } | null;
  clientProfile?: { location?: string | null; bio?: string | null; phone?: string | null } | null;
  createdAt: string;
  updatedAt: string;
};
