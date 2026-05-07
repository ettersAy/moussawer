import { Clock, Trash2 } from "lucide-react";
import type { CalendarBlock, DayAvailability } from "./types";
import { isoDate, dayLabel, dayOfMonth } from "./utils";

type DayDetailProps = {
  date: Date;
  rangeData: Record<string, DayAvailability>;
  blocks: CalendarBlock[];
  onRemoveBlock: (id: string) => void;
};

function slotTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function DayDetail({ date, rangeData, blocks, onRemoveBlock }: DayDetailProps) {
  const key = isoDate(date);
  const data = rangeData[key];
  const dayBlocks = blocks.filter((b) => {
    const start = isoDate(new Date(b.startAt));
    const end = isoDate(new Date(b.endAt));
    return key >= start && key <= end;
  });
  const bookings = data?.slots.filter((s) => !s.available && s.reason?.includes("booked")) ?? [];

  return (
    <div className="calendar-day-detail">
      <h3>{dayLabel(date)} {dayOfMonth(date)}</h3>
      {dayBlocks.map((b) => (
        <div key={b.id} className="day-detail-booking cancelled" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>
            <Clock size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Blocked: {slotTime(b.startAt)} – {slotTime(b.endAt)}
            {b.reason && <span className="muted" style={{ marginLeft: "6px" }}>— {b.reason}</span>}
          </span>
          <button type="button" className="ghost-button compact" style={{ color: "var(--red)", marginLeft: "auto" }}
            onClick={() => onRemoveBlock(b.id)}>
            <Trash2 size={12} />
          </button>
        </div>
      ))}
      {bookings.map((s) => (
        <div key={s.startAt} className="day-detail-booking confirmed">
          <Clock size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
          Booked: {slotTime(s.startAt)} – {slotTime(s.endAt)}
        </div>
      ))}
      {!dayBlocks.length && !bookings.length && (
        <p className="muted" style={{ fontSize: "0.82rem" }}>No blocks or bookings on this day.</p>
      )}
    </div>
  );
}
