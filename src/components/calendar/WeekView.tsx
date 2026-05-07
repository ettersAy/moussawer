import type { CalendarBlock, DayAvailability } from "./types";
import { isoDate, dayLabel, dayOfMonth, isPastDay, isTodayDay, isSameDate } from "./utils";

type WeekViewProps = {
  days: Date[];
  rangeData: Record<string, DayAvailability>;
  blocks: CalendarBlock[];
  selected: Date;
  onSelectSlot: (start: string, end: string) => void;
};

export function WeekView({ days, rangeData, blocks, selected, onSelectSlot }: WeekViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="calendar-week-grid">
      <div className="calendar-time-gutter">
        <div className="calendar-time-label" />
        {hours.map((h) => (
          <div key={h} className="calendar-time-label">
            {h === 0 ? "12a" : h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`}
          </div>
        ))}
      </div>
      {days.map((d) => {
        const key = isoDate(d);
        const data = rangeData[key];
        const todayCls = isTodayDay(d) ? " today" : "";
        const selCls = isSameDate(d, selected) ? " selected" : "";
        return (
          <div key={key} className={`calendar-week-column${selCls}`}>
            <div className={`calendar-week-header${todayCls}`}>
              {dayLabel(d)} {dayOfMonth(d)}
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
              const slot = data?.slots.find((s) => {
                const st = new Date(s.startAt).getTime();
                const sh = new Date(slotStart).getTime();
                return st >= sh && st < sh + 3600000;
              });
              const isBooked = slot && !slot.available && slot.reason?.includes("booked");
              const isPast = isPastDay(d) || (isTodayDay(d) && h < new Date().getHours());
              return (
                <div
                  key={h}
                  className={`calendar-week-slot${isPast ? " past" : ""}${isBlocked ? " blocked" : ""}${isBooked ? " booked" : ""}`}
                  onClick={() => !isPast && onSelectSlot(slotStart, slotEnd)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
