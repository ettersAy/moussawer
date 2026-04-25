import { CalendarClock, Camera, CheckCircle2, FileWarning, MessageCircle, Plus, Shield, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { api, money, shortDate, type Booking, type CaseItem, type Conversation, type Notification, type Photographer, type Service } from "../lib/api";

type AdminStats = {
  totalUsers: number;
  totalPhotographers: number;
  totalClients: number;
  totalBookings: number;
  pendingBookings: number;
  openIncidents: number;
  openDisputes: number;
  recentMessages: number;
  moderationQueue: number;
};

export function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [incidents, setIncidents] = useState<CaseItem[]>([]);
  const [disputes, setDisputes] = useState<CaseItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [profile, setProfile] = useState<Photographer | null>(null);
  const [serviceForm, setServiceForm] = useState({ title: "", description: "", durationMinutes: 90, price: 300 });

  useEffect(() => {
    api<Booking[]>("/bookings").then((response) => setBookings(response.data));
    api<Conversation[]>("/conversations").then((response) => setConversations(response.data));
    api<CaseItem[]>("/incidents").then((response) => setIncidents(response.data));
    api<CaseItem[]>("/disputes").then((response) => setDisputes(response.data));
    api<Notification[]>("/notifications").then((response) => setNotifications(response.data));
    if (user?.role === "ADMIN") api<AdminStats>("/admin/stats").then((response) => setStats(response.data));
    if (user?.role === "PHOTOGRAPHER") api<Photographer>("/me/photographer").then((response) => setProfile(response.data));
  }, [user?.role]);

  const upcoming = useMemo(() => bookings.filter((booking) => new Date(booking.startAt) >= new Date() && booking.status !== "CANCELLED"), [bookings]);
  const unread = notifications.filter((notification) => !notification.readAt).length;

  async function updateBooking(booking: Booking, status: Booking["status"]) {
    const response = await api<Booking>(`/bookings/${booking.id}/status`, { method: "PATCH", body: { status } });
    setBookings((current) => current.map((item) => (item.id === booking.id ? response.data : item)));
  }

  async function addService(event: React.FormEvent) {
    event.preventDefault();
    const response = await api<Service>("/me/services", { method: "POST", body: serviceForm });
    setProfile((current) => current ? { ...current, services: [...current.services, response.data] } : current);
    setServiceForm({ title: "", description: "", durationMinutes: 90, price: 300 });
  }

  return (
    <section className="page dashboard">
      <div className="split-heading">
        <div>
          <span className="eyebrow">{user?.role?.toLowerCase()} dashboard</span>
          <h1>Good to see you, {user?.name}.</h1>
        </div>
      </div>

      <div className="metrics-grid">
        {user?.role === "ADMIN" && stats ? (
          <>
            <Metric icon={<Users />} label="Users" value={stats.totalUsers} />
            <Metric icon={<Camera />} label="Photographers" value={stats.totalPhotographers} />
            <Metric icon={<CalendarClock />} label="Bookings" value={stats.totalBookings} />
            <Metric icon={<FileWarning />} label="Open cases" value={stats.openIncidents + stats.openDisputes} />
          </>
        ) : (
          <>
            <Metric icon={<CalendarClock />} label="Upcoming" value={upcoming.length} />
            <Metric icon={<MessageCircle />} label="Conversations" value={conversations.length} />
            <Metric icon={<FileWarning />} label="Open cases" value={incidents.length + disputes.length} />
            <Metric icon={<Shield />} label="Unread alerts" value={unread} />
          </>
        )}
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Bookings</h2>
          <div className="table-list">
            {bookings.slice(0, 8).map((booking) => (
              <div className="table-row" key={booking.id}>
                <div>
                  <strong>{booking.service.title}</strong>
                  <p>{shortDate(booking.startAt)} with {user?.role === "CLIENT" ? booking.photographer.name : booking.client.name}</p>
                </div>
                <StatusBadge value={booking.status} />
                <div className="inline-actions">
                  {user?.role === "PHOTOGRAPHER" && booking.status === "PENDING" && (
                    <button className="ghost-button compact" type="button" onClick={() => updateBooking(booking, "CONFIRMED")}>
                      <CheckCircle2 size={15} /> Confirm
                    </button>
                  )}
                  {user?.role === "PHOTOGRAPHER" && booking.status === "CONFIRMED" && (
                    <button className="ghost-button compact" type="button" onClick={() => updateBooking(booking, "COMPLETED")}>
                      Complete
                    </button>
                  )}
                  {booking.status === "PENDING" && user?.role !== "ADMIN" && (
                    <button className="ghost-button compact" type="button" onClick={() => updateBooking(booking, "CANCELLED")}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
            {!bookings.length && <p className="muted">No bookings yet.</p>}
          </div>
        </section>

        <section className="panel">
          <h2>Recent messages</h2>
          <div className="list-stack">
            {conversations.slice(0, 5).map((conversation) => (
              <article className="soft-row" key={conversation.id}>
                <strong>{conversation.subject}</strong>
                <p>{conversation.lastMessage?.body ?? "No messages yet."}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Cases</h2>
          <div className="list-stack">
            {[...incidents, ...disputes].slice(0, 5).map((item) => (
              <article className="soft-row" key={item.id}>
                <div className="card-title-row">
                  <strong>{item.category ?? item.type}</strong>
                  <StatusBadge value={item.status} />
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Notifications</h2>
          <div className="list-stack">
            {notifications.slice(0, 6).map((notification) => (
              <article className="soft-row" key={notification.id}>
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </article>
            ))}
          </div>
        </section>

        {user?.role === "PHOTOGRAPHER" && profile && (
          <section className="panel wide-panel">
            <div className="split-heading compact-heading">
              <div>
                <h2>Photographer workspace</h2>
                <p className="muted">Profile completion, packages, portfolio, and calendar are API-managed for web and mobile clients.</p>
              </div>
              <strong>{money(profile.startingPrice)} starting price</strong>
            </div>
            <div className="service-manager">
              <div className="list-stack">
                {profile.services.map((service) => (
                  <article className="soft-row" key={service.id}>
                    <strong>{service.title}</strong>
                    <p>{service.durationMinutes} minutes · {money(service.price)}</p>
                  </article>
                ))}
              </div>
              <form onSubmit={addService} className="inline-form">
                <input value={serviceForm.title} onChange={(event) => setServiceForm({ ...serviceForm, title: event.target.value })} placeholder="Package title" />
                <input value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} placeholder="Description" />
                <input type="number" value={serviceForm.price} onChange={(event) => setServiceForm({ ...serviceForm, price: Number(event.target.value) })} />
                <button className="solid-button compact" type="submit"><Plus size={15} /> Add</button>
              </form>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}
