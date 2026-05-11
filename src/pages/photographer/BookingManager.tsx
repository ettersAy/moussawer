import { BookOpen, MessageCircle, Star, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../components/shared/Toast";
import { api, shortDate, type Booking, type Photographer } from "../../lib/api";

export function BookingManager({ bookings, photographer, onRefresh }: { bookings: Booking[]; photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const navigate = useNavigate();
  const my = bookings.filter((b) => b.photographer.id === photographer.id);

  async function transition(id: string, status: string) {
    try {
      await api(`/bookings/${id}/status`, { method: "PATCH", body: { status } });
      toast.success(`Booking ${status.toLowerCase()}.`);
      onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  if (!my.length) return (
    <div className="empty-state">
      <BookOpen size={32} />
      <h2>No bookings yet</h2>
      <p>When clients book your services, they will appear here.</p>
    </div>
  );

  return (
    <div className="table-list">
      {my.map((b) => (
        <article className="table-row" key={b.id} style={{ gridTemplateColumns: "1fr auto auto" }}>
          <div>
            <div className="card-title-row">
              <strong>{b.service.title}</strong>
              <StatusBadge value={b.status} />
            </div>
            <p className="muted" style={{ margin: "4px 0" }}>
              {b.client.name} · {shortDate(b.startAt)} · {b.location}
            </p>
            {b.notes && <p style={{ fontSize: "0.88rem" }}>{b.notes}</p>}
            <div className="booking-timeline">
              {b.status === "PENDING" && <span className="booking-timeline-item"><span className="booking-timeline-dot active" />Awaiting confirmation</span>}
              {b.confirmedAt && <span className="booking-timeline-item"><span className="booking-timeline-dot active" />Confirmed</span>}
              {b.completedAt && <span className="booking-timeline-item"><span className="booking-timeline-dot active" />Completed</span>}
              {b.cancelledAt && <span className="booking-timeline-item"><span className="booking-timeline-dot active" />Cancelled: {b.cancellationReason}</span>}
            </div>
          </div>
          <div className="inline-actions">
            {b.conversation && b.status !== "CANCELLED" && (
              <button className="ghost-button compact" onClick={() => navigate(`/messages?conversation=${b.conversation!.id}`)}>
                <MessageCircle size={14} /> Message
              </button>
            )}
            {b.status === "PENDING" && (
              <>
                <button className="ghost-button compact" onClick={() => transition(b.id, "CONFIRMED")}>
                  <Star size={14} /> Confirm
                </button>
                <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => {
                  const reason = prompt("Cancellation reason:");
                  if (reason) api(`/bookings/${b.id}/status`, { method: "PATCH", body: { status: "CANCELLED", cancellationReason: reason } }).then(() => { toast.success("Booking cancelled."); onRefresh(); }).catch((e: any) => toast.error(e.message));
                }}>
                  <X size={14} /> Cancel
                </button>
              </>
            )}
            {b.status === "CONFIRMED" && (
              <button className="ghost-button compact" onClick={() => transition(b.id, "COMPLETED")}>
                <Star size={14} /> Complete
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
