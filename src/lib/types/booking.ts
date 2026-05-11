export type Booking = {
  id: string;
  client: { id: string; name?: string; email?: string };
  photographer: { id: string; name?: string; slug?: string; email?: string };
  service: { id: string; title?: string; durationMinutes?: number; price?: number };
  conversation?: { id: string };
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
