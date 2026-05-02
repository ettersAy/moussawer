import { AlertTriangle } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import { money, shortDate, type Booking } from "../../lib/api";

export function BookingsTab({
  bookings,
  bookingFilter,
  onBookingFilterChange,
  onUpdateStatus
}: {
  bookings: Booking[];
  bookingFilter: string;
  onBookingFilterChange: (value: string) => void;
  onUpdateStatus: (booking: Booking, status: string) => void;
}) {
  return (
    <div className="admin-section">
      <section className="panel">
        <div className="split-heading compact-heading">
          <h2>Bookings ({bookings.length})</h2>
          <select value={bookingFilter} onChange={(e) => onBookingFilterChange(e.target.value)}>
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div className="table-list">
          {bookings.map((b) => (
            <div className="table-row" key={b.id} style={{ gridTemplateColumns: "1fr auto auto" }}>
              <div>
                <div className="card-title-row">
                  <strong>{b.service.title}</strong>
                  <StatusBadge value={b.status} />
                </div>
                <p className="muted">
                  {b.client.name} ↔ {b.photographer.name} · {shortDate(b.startAt)} · {b.location} · {money(b.priceEstimate)}
                </p>
                {b.cancellationReason && <p>Reason: {b.cancellationReason}</p>}
              </div>
              <div className="inline-actions">
                {b.status === "PENDING" && (
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(b, "CANCELLED")}>
                    <AlertTriangle size={14} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
          {!bookings.length && <p className="muted">No bookings found.</p>}
        </div>
      </section>
    </div>
  );
}
