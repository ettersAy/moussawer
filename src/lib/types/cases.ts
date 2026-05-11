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
