const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
const TOKEN_KEY = "moussawer_token";

export type ApiEnvelope<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CLIENT" | "PHOTOGRAPHER";
  status: string;
  avatarUrl?: string | null;
  photographerProfile?: { id: string; slug: string } | null;
  clientProfile?: { location?: string | null; bio?: string | null; phone?: string | null } | null;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
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
  categories: Category[];
  services: Service[];
  portfolioItems: PortfolioItem[];
  reviews: Review[];
};

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

export type Booking = {
  id: string;
  client: { id: string; name?: string; email?: string };
  photographer: { id: string; name?: string; slug?: string; email?: string };
  service: { id: string; title?: string; durationMinutes?: number; price?: number };
  startAt: string;
  endAt: string;
  location: string;
  notes?: string | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  priceEstimate: number;
  cancellationReason?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  subject: string;
  bookingId?: string | null;
  participants: { user: Pick<User, "id" | "name" | "role" | "avatarUrl">; lastReadAt?: string | null }[];
  lastMessage?: Message | null;
};

export type Message = {
  id: string;
  conversationId: string;
  sender: Pick<User, "id" | "name" | "role" | "avatarUrl">;
  body: string;
  attachmentUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type CaseItem = {
  id: string;
  reporter: { id: string; name?: string; email?: string };
  targetUser?: { id: string; name?: string; email?: string } | null;
  bookingId?: string | null;
  category?: string;
  type?: string;
  description: string;
  status: string;
  adminNotes?: string | null;
  resolution?: string | null;
  createdAt: string;
};

export type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  client: { id: string; name?: string; avatarUrl?: string | null };
  createdAt: string;
};

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
};

export type Availability = {
  date: string;
  timezone: string;
  slots: { startAt: string; endAt: string; available: boolean; reason?: string | null }[];
};

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export async function api<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  if (token && options.auth !== false) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  if (response.status === 204) return { data: undefined as T };

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error?.message ?? "Request failed", payload.error?.code ?? "REQUEST_FAILED", response.status, payload.error?.details);
  }
  return payload;
}

export function money(centsOrDollars: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(centsOrDollars);
}

export function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}
