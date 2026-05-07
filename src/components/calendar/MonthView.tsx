import type { CalendarBlock, DayAvailability } from "./types";
import { isoDate, isOtherMonth, isPastDay, isTodayDay, isSameDate, dayOfMonth, DAYS_SHORT } from "./utils";

function dayStatus(slots: DayAvailability["slots"]) {
  if (!slots.length) return "none";
  const total = slots.length;
  const available = slots.filter((s) => s.available).length;
  if (available === 0) return "blocked";
  if (available < total) return "partial";
  return "available";
}

type MonthViewProps = {
  days: Date[];
  anchor: Date;
  selected: Date;
  rangeData: Record<string, DayAvailability>;
  blocks: CalendarBlock[];
  onSelect: (d: Date) => void;
};

export function MonthView({ days, anchor, selected, rangeData, blocks, onSelect }: MonthViewProps) {
  return (
    <div className="calendar-month-grid">
      {DAYS_SHORT.map((d) => (
        <div key={d} className="calendar-day-header">{d}</div>
      ))}
      {days.map((d) => {
        const key = isoDate(d);
        const data = rangeData[key];
        const status = data ? dayStatus(data.slots) : null;
        const dayBlocks = blocks.filter((b) => {
          const start = isoDate(new Date(b.startAt));
          const end = isoDate(new Date(b.endAt));
          return key >= start && key <= end;
        });
        const cls = [
          "calendar-day-cell",
          isOtherMonth(d, anchor) && "other-month",
          isPastDay(d) && "past",
          isTodayDay(d) && "today",
          isSameDate(d, selected) && "selected",
        ].filter(Boolean).join(" ");

        return (
          <button key={d.toISOString()} type="button" className={cls} onClick={() => onSelect(d)}>
            <span className="calendar-day-number">{dayOfMonth(d)}</span>
            <span className="calendar-day-indicators">
              {status === "available" && <span className="calendar-mini-dot available" />}
              {status === "partial" && <span className="calendar-mini-dot partial" />}
              {status === "blocked" && <span className="calendar-mini-dot blocked" />}
              {dayBlocks.length > 0 && <span className="calendar-mini-dot blocked" title="Blocked" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
