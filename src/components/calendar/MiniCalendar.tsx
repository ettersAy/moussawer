import { monthDays, dayOfMonth, monthYearLabel, isOtherMonth, isTodayDay, isSameDate } from "./utils";

type MiniCalendarProps = {
  anchor: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function MiniCalendar({ anchor, selected, onSelect, onPrev, onNext }: MiniCalendarProps) {
  const days = monthDays(anchor);
  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button type="button" className="mini-calendar-nav" onClick={onPrev}>&lt;</button>
        <span>{monthYearLabel(anchor)}</span>
        <button type="button" className="mini-calendar-nav" onClick={onNext}>&gt;</button>
      </div>
      <div className="mini-calendar-grid">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d} className="mini-calendar-day-header">{d}</span>
        ))}
        {days.map((d) => (
          <button
            key={d.toISOString()}
            type="button"
            className={`mini-calendar-day${isOtherMonth(d, anchor) ? " other-month" : ""}${isTodayDay(d) ? " today" : ""}${isSameDate(d, selected) ? " selected" : ""}`}
            onClick={() => onSelect(d)}
          >
            {dayOfMonth(d)}
          </button>
        ))}
      </div>
    </div>
  );
}
