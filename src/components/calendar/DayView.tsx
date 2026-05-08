import type { CalendarBlock, DayAvailability } from "./types";
import { isoDate, dayLabel, dayOfMonth, monthYearLabel, slotTime, checkSlotOverlap, HOUR_LABELS_FULL } from "./utils";

type DayViewProps = {
  date: Date;
  rangeData: Record<string, DayAvailability>;
  blocks: CalendarBlock[];
  onSelectSlot: (start: string, end: string) => void;
};

export function DayView({ date, rangeData, blocks, onSelectSlot }: DayViewProps) {
  const key = isoDate(date);
  const data = rangeData[key];
  const slots = data?.slots ?? [];
  const isToday = date.toDateString() === new Date().toDateString();

  return (
    <div className="calendar-day-view">
      <div className={`calendar-day-header-bar${isToday ? " today" : ""}`}>
        {dayLabel(date)} {dayOfMonth(date)} {monthYearLabel(date)}
      </div>
      {Array.from({ length: 24 }, (_, h) => {
        const ss = `${key}T${String(h).padStart(2, "0")}:00:00.000Z`;
        const se = `${key}T${String(h).padStart(2, "0")}:59:59.999Z`;
        const { isBlocked, isBooked, isPast } = checkSlotOverlap(ss, se, date, h, blocks, slots);

        return (
          <div
            key={h}
            className={`calendar-day-row${isPast ? " past" : ""}${isBlocked ? " blocked" : ""}${isBooked ? " booked" : ""}`}
            onClick={() => !isPast && onSelectSlot(ss, se)}
          >
            <div className="calendar-day-row-time">{HOUR_LABELS_FULL[h]}</div>
            <div className="calendar-day-row-content">
              {isBlocked && <span className="tag" style={{ background: "var(--red-soft)", color: "var(--red)" }}>Blocked</span>}
              {isBooked && (() => {
                const bookedSlot = slots.find((s) => {
                  const st = new Date(s.startAt).getTime();
                  return st >= new Date(ss).getTime() && st < new Date(ss).getTime() + 3600000;
                });
                return bookedSlot ? (
                  <span className="tag" style={{ background: "#dbeafe", color: "#3b82f6" }}>
                    Booked {slotTime(bookedSlot.startAt)} – {slotTime(bookedSlot.endAt)}
                  </span>
                ) : null;
              })()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
