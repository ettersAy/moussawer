export type CalendarBlock = {
  id: string;
  photographerId: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
  source?: string | null;
  createdAt: string;
};

export type AvailabilityRule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  timezone: string;
};

export type Availability = {
  date: string;
  timezone: string;
  slots: { startAt: string; endAt: string; available: boolean; reason?: string | null }[];
};
