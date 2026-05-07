import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay,
  isPast, isToday, addMonths, subMonths,
  addWeeks, subWeeks, addDays,
  parseISO, startOfDay,
} from "date-fns";

export function monthDays(anchor: Date): Date[] {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 0 });
  const end = endOfWeek(anchor, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

export function dayLabel(d: Date): string {
  return format(d, "EEE");
}

export function dayOfMonth(d: Date): number {
  return d.getDate();
}

export function monthYearLabel(d: Date): string {
  return format(d, "MMMM yyyy");
}

export function isoDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function isoToDate(s: string): Date {
  return parseISO(s);
}

export function isOtherMonth(d: Date, anchor: Date): boolean {
  return !isSameMonth(d, anchor);
}

export function isPastDay(d: Date): boolean {
  return isPast(addDays(startOfDay(d), 1));
}

export function isTodayDay(d: Date): boolean {
  return isToday(d);
}

export function isSameDate(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}

export function nextMonth(d: Date): Date {
  return addMonths(d, 1);
}

export function prevMonth(d: Date): Date {
  return subMonths(d, 1);
}

export function nextWeek(d: Date): Date {
  return addWeeks(d, 1);
}

export function prevWeek(d: Date): Date {
  return subWeeks(d, 1);
}

export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const HOUR_LABELS = [
  "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a",
  "12p", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p",
] as const;

export function slotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
}

export type SlotOverlap = {
  isBlocked: boolean;
  isBooked: boolean;
  isPast: boolean;
};

export function checkSlotOverlap(
  slotStart: string,
  slotEnd: string,
  dayDate: Date,
  hour: number,
  blocks: { startAt: string; endAt: string }[],
  slots?: { startAt: string; endAt: string; available: boolean }[],
): SlotOverlap {
  const bs = new Date(slotStart).getTime();
  const be = new Date(slotEnd).getTime();

  const isBlocked = blocks.some((b) => {
    const bbStart = new Date(b.startAt).getTime();
    const bbEnd = new Date(b.endAt).getTime();
    return bs < bbEnd && be > bbStart;
  });

  const slot = slots?.find((s) => {
    const st = new Date(s.startAt).getTime();
    return st >= bs && st < bs + 3600000;
  });

  const isBooked = !!(slot && !slot.available);
  const isPast = isPastDay(dayDate) || (isTodayDay(dayDate) && hour < new Date().getHours());

  return { isBlocked, isBooked, isPast };
}
