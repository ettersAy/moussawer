import {
  BarChart3, CalendarClock, ClipboardList, Heart, Star,
  StarOff, UserCheck, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../components/shared/Toast";
import { useAuth } from "../hooks/useAuth";
import { api, money, shortDate, type Booking, type Photographer } from "../lib/api";
import { Metric } from "./admin/Metric";

export function DashboardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favorites, setFavorites] = useState<Photographer[]>([]);
  const [stats, setStats] = useState({ totalBookings: 0, pending: 0, confirmed: 0, completed: 0 });
  const [reviewForm, setReviewForm] = useState<{ bookingId: string; rating: number; comment: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadBookings();
    if (user.role === "CLIENT") loadFavorites();
  }, [user]);

  async function loadBookings() {
    try {
      const res = await api<Booking[]>("/bookings");
      const b = res.data;
      setBookings(b);
      setStats({
        totalBookings: b.length,
        pending: b.filter((x) => x.status === "PENDING").length,
        confirmed: b.filter((x) => x.status === "CONFIRMED").length,
        completed: b.filter((x) => x.status === "COMPLETED").length,
      });
    } catch { /* auth-guarded */ }
  }

  async function loadFavorites() {
    try {
      const res = await api<Photographer[]>("/favorites");
      setFavorites(res.data);
    } catch { /* auth-guarded */ }
  }

  async function cancelBooking(booking: Booking) {
    const reason = prompt("سبب الإلغاء (اختياري):") || "";
    try {
      await api(`/bookings/${booking.id}/status`, { method: "PATCH", body: { status: "CANCELLED", cancellationReason: reason } });
      toast.success("تم إلغاء الحجز.");
      loadBookings();
    } catch (err: any) { toast.error(err.message); }
  }

  async function submitReview() {
    if (!reviewForm) return;
    try {
      await api("/reviews", { method: "POST", body: reviewForm });
      toast.success("تم إرسال التقييم! شكراً لك.");
      setReviewForm(null);
      loadBookings();
    } catch (err: any) { toast.error(err.message); }
  }

  async function removeFavorite(id: string) {
    await api(`/favorites/${id}`, { method: "DELETE" });
    toast.success("تمت الإزالة من المفضلة.");
    loadFavorites();
  }

  if (!user) return null;

  return (
    <section className="page dashboard">
      <div className="split-heading compact-heading">
        <div>
          <span className="eyebrow">{user.role === "CLIENT" ? "لوحة تحكم العميل" : `${user.role.toLowerCase()} dashboard`}</span>
          <h1>{user.role === "CLIENT" ? `مرحباً بعودتك، ${user.name}` : `Welcome back, ${user.name}`}</h1>
        </div>
      </div>

      <div className="metrics-grid">
        <Metric icon={<CalendarClock />} label={user.role === "CLIENT" ? "إجمالي الحجوزات" : "Total bookings"} value={stats.totalBookings} />
        <Metric icon={<ClipboardList />} label={user.role === "CLIENT" ? "قيد الانتظار" : "Pending"} value={stats.pending} />
        <Metric icon={<UserCheck />} label={user.role === "CLIENT" ? "مؤكد" : "Confirmed"} value={stats.confirmed} />
        <Metric icon={<BarChart3 />} label={user.role === "CLIENT" ? "مكتمل" : "Completed"} value={stats.completed} />
      </div>

      <div className="dashboard-grid">
        <section className="panel wide-panel">
          <h2>{user.role === "CLIENT" ? "حجوزاتك" : "Your Bookings"}</h2>
          {bookings.length === 0 ? (
            <p className="muted">{user.role === "CLIENT" ? "لا توجد حجوزات بعد. تصفح المصورين للبدء." : "No bookings yet. Browse photographers to get started."}</p>
          ) : (
            <div className="list-stack">
              {bookings.map((b) => (
                <article className="soft-row" key={b.id}>
                  <div className="card-title-row">
                    <div>
                      <strong>{b.service.title}</strong>
                      <StatusBadge value={b.status} />
                    </div>
                    <span className="muted">{money(b.priceEstimate)}</span>
                  </div>
                  <p>
                    {user.role === "CLIENT" ? `المصور: ${b.photographer.name}` : `Client: ${b.client.name}`}
                    {" · "}{shortDate(b.startAt)} · {b.location}
                  </p>
                  {b.notes && <p className="muted">{b.notes}</p>}
                  {b.cancellationReason && <p className="tone-warning" style={{ padding: "4px 8px", borderRadius: "4px" }}>{user.role === "CLIENT" ? "ملغي:" : "Cancelled:"} {b.cancellationReason}</p>}

                  <div className="inline-actions" style={{ marginTop: "8px" }}>
                    {user.role === "CLIENT" && b.status === "PENDING" && (
                      <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => cancelBooking(b)}>
                        <X size={14} /> إلغاء
                      </button>
                    )}
                    {user.role === "CLIENT" && b.status === "COMPLETED" && (
                      <button className="ghost-button compact" onClick={() => setReviewForm({ bookingId: b.id, rating: 5, comment: "" })}>
                        <Star size={14} /> كتابة تقييم
                      </button>
                    )}
                    {user.role === "PHOTOGRAPHER" && b.status === "PENDING" && (
                      <span className="muted" style={{ fontSize: "0.85rem" }}>Manage in <a href="/photographer" style={{ color: "var(--blue)" }}>Workspace</a></span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {user.role === "CLIENT" && (
          <section className="panel">
            <h2><Heart size={18} style={{ verticalAlign: "middle", marginRight: "6px" }} />المفضلة ({favorites.length})</h2>
            {favorites.length === 0 ? (
              <p className="muted">احفظ المصورين للحجز بسرعة لاحقاً.</p>
            ) : (
              <div className="list-stack">
                {favorites.map((p) => (
                  <article className="soft-row" key={p.id}>
                    <div className="card-title-row">
                      <div>
                        <strong>{p.name}</strong>
                        <p className="muted" style={{ margin: 0 }}>{p.city} · ⭐ {p.rating}</p>
                      </div>
                      <div className="inline-actions">
                        <a href={`/photographers/${p.slug}`} className="ghost-button compact">عرض</a>
                        <button className="ghost-button compact" onClick={() => removeFavorite(p.id)}>
                          <StarOff size={14} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {reviewForm && (
        <div className="modal-overlay" onClick={() => setReviewForm(null)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>{user.role === "CLIENT" ? "كتابة تقييم" : "Write a Review"}</h2>
            <div className="inline-actions" style={{ justifyContent: "center" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" className="ghost-button compact"
                  style={reviewForm.rating >= n ? { color: "#946200", borderColor: "#946200" } : {}}
                  onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                  <Star size={20} fill={reviewForm.rating >= n ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
            <label>
              {user.role === "CLIENT" ? "تعليق (اختياري)" : "Comment (optional)"}
              <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
            </label>
            <div className="modal-actions">
              <button className="ghost-button" onClick={() => setReviewForm(null)}>{user.role === "CLIENT" ? "إلغاء" : "Cancel"}</button>
              <button className="solid-button" onClick={submitReview}>{user.role === "CLIENT" ? "إرسال التقييم" : "Submit Review"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


