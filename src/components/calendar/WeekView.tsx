import type { CalendarBlock, DayAvailability } from "./types";
import { isoDate, dayLabel, dayOfMonth, isTodayDay, isSameDate, checkSlotOverlap, HOUR_LABELS_COMPACT } from "./utils";

type WeekViewProps = {
  days: Date[];
  rangeData: Record<string, DayAvailability>;
  blocks: CalendarBlock[];
  selected: Date;
  onSelectSlot: (start: string, end: string) => void;
};

export function WeekView({ days, rangeData, blocks, selected, onSelectSlot }: WeekViewProps) {
  return (
    <div className="calendar-week-grid">
      <div className="calendar-time-gutter">
        <div className="calendar-time-label" />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={h} className="calendar-time-label">{HOUR_LABELS_COMPACT[h]}</div>
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
            {Array.from({ length: 24 }, (_, h) => {
              const slotStart = `${key}T${String(h).padStart(2, "0")}:00:00.000Z`;
              const slotEnd = `${key}T${String(h).padStart(2, "0")}:59:59.999Z`;
              const { isBlocked, isBooked, isPast } = checkSlotOverlap(
                slotStart, slotEnd, d, h, blocks, data?.slots,
              );
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
