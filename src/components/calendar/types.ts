export type AvailabilityRule = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
  isActive?: boolean;
};

export type CalendarBlock = {
  id: string;
  photographerId?: string;
  startAt: string;
  endAt: string;
  reason?: string | null;
  createdAt?: string;
};

export type SlotInfo = {
  startAt: string;
  endAt: string;
  available: boolean;
  reason?: string | null;
};

export type DayAvailability = {
  date: string;
  timezone: string;
  slots: SlotInfo[];
};

export type CalendarView = "month" | "week" | "day";
