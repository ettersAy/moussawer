import { ApiError } from "./types/api";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";
const TOKEN_KEY = "moussawer_token";

// Re-export all types from the types directory
export type { ApiEnvelope } from "./types/api";
export { ApiError } from "./types/api";
export type { User } from "./types/user";
export type { Category } from "./types/category";
export type { Photographer, Service, PortfolioItem, Review } from "./types/photographer";
export type { Booking } from "./types/booking";
export type { CalendarBlock, AvailabilityRule, Availability } from "./types/calendar";
export type { Message, Conversation } from "./types/messaging";
export type { CaseItem } from "./types/cases";
export type { Notification } from "./types/notification";

// Re-export utilities
export { money, shortDate } from "./utils";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<import("./types/api").ApiEnvelope<T>> {
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
    if (response.status === 401 && token) {
      localStorage.removeItem(TOKEN_KEY);
      const publicPaths = ["/", "/login", "/register", "/photographers", "/support"];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = "/login";
      }
    }
    throw new ApiError(payload.error?.message ?? "Request failed", payload.error?.code ?? "REQUEST_FAILED", response.status, payload.error?.details);
  }
  return payload;
}
