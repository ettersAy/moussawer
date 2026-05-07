import type { CalendarBlock, DayAvailability } from "./types";
import { isoDate, dayLabel, dayOfMonth, monthYearLabel, isPastDay, isTodayDay } from "./utils";

type DayViewProps = {
  date: Date;
  rangeData: Record<string, DayAvailability>;
  blocks: CalendarBlock[];
  onSelectSlot: (start: string, end: string) => void;
};

function slotTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function DayView({ date, rangeData, blocks, onSelectSlot }: DayViewProps) {
  const key = isoDate(date);
  const data = rangeData[key];
  const slots = data?.slots ?? [];
  const isToday = isTodayDay(date);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="calendar-day-view">
      <div className={`calendar-day-header-bar${isToday ? " today" : ""}`}>
        {dayLabel(date)} {dayOfMonth(date)} {monthYearLabel(date)}
      </div>
      {hours.map((h) => {
        const slotStart = `${key}T${String(h).padStart(2, "0")}:00:00.000Z`;
        const slotEnd = `${key}T${String(h).padStart(2, "0")}:59:59.999Z`;
        const isBlocked = blocks.some((b) => {
          const bs = new Date(b.startAt).getTime();
          const be = new Date(b.endAt).getTime();
          const ss = new Date(slotStart).getTime();
          return ss < be && new Date(slotEnd).getTime() > bs;
        });
        const slot = slots.find((s) => {
          const st = new Date(s.startAt).getTime();
          const sh = new Date(slotStart).getTime();
          return st >= sh && st < sh + 3600000;
        });
        const isBooked = slot && !slot.available;
        const isPast = isPastDay(date) || (isToday && h < new Date().getHours());
        const label = h === 0 ? "12:00 AM" : h < 12 ? `${h}:00 AM` : h === 12 ? "12:00 PM" : `${h - 12}:00 PM`;

        return (
          <div
            key={h}
            className={`calendar-day-row${isPast ? " past" : ""}${isBlocked ? " blocked" : ""}${isBooked ? " booked" : ""}`}
            onClick={() => !isPast && onSelectSlot(slotStart, slotEnd)}
          >
            <div className="calendar-day-row-time">{label}</div>
            <div className="calendar-day-row-content">
              {isBlocked && <span className="tag" style={{ background: "var(--red-soft)", color: "var(--red)" }}>Blocked</span>}
              {isBooked && slot && (
                <span className="tag" style={{ background: "#dbeafe", color: "#3b82f6" }}>
                  Booked {slotTime(slot.startAt)} – {slotTime(slot.endAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
