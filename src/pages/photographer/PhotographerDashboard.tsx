import {
  BookOpen, Calendar, Camera, Edit3, EyeOff,
  Grid3X3, Image, Package, Plus, Save, Settings, Star, Trash2, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Calendar as CalendarComponent } from "../../components/calendar/Calendar";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../components/shared/Toast";
import { useAuth } from "../../hooks/useAuth";
import { api, money, shortDate, type Booking, type Photographer, type PortfolioItem, type Service } from "../../lib/api";

type Tab = "bookings" | "services" | "portfolio" | "availability" | "profile";

export function PhotographerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("bookings");
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);
  async function loadAll() {
    try {
      const [pRes, bRes] = await Promise.all([
        api<Photographer>("/me/photographer"),
        api<Booking[]>("/bookings")
      ]);
      setPhotographer(pRes.data);
      setBookings(bRes.data);
    } catch { /* auth-guarded */ } finally { setLoading(false); }
  }

  async function refreshPhotographer() {
    const res = await api<Photographer>("/me/photographer");
    setPhotographer(res.data);
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "bookings", label: "Bookings", icon: <BookOpen size={15} /> },
    { key: "services", label: "Services", icon: <Package size={15} /> },
    { key: "portfolio", label: "Portfolio", icon: <Grid3X3 size={15} /> },
    { key: "availability", label: "Calendar", icon: <Calendar size={15} /> },
    { key: "profile", label: "Profile", icon: <Settings size={15} /> },
  ];

  if (loading) return <section className="page"><div className="panel">Loading workspace...</div></section>;
  if (!photographer) return <section className="page"><div className="panel">Photographer profile not found.</div></section>;

  return (
    <section className="page">
      <div className="split-heading compact-heading">
        <div>
          <span className="eyebrow">Photographer workspace</span>
          <h1>Welcome back, {user?.name}</h1>
        </div>
      </div>

      <nav className="section-tabs" aria-label="Photographer sections">
        {tabs.map((tab) => (
          <button key={tab.key} type="button" className={`section-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "bookings" && <BookingManager bookings={bookings} photographer={photographer} onRefresh={loadAll} />}
      {activeTab === "services" && <ServiceManager photographer={photographer} onRefresh={refreshPhotographer} />}
      {activeTab === "portfolio" && <PortfolioManager photographer={photographer} onRefresh={refreshPhotographer} />}
      {activeTab === "availability" && <AvailabilityManager photographer={photographer} onRefresh={refreshPhotographer} />}
      {activeTab === "profile" && <ProfileManager photographer={photographer} onRefresh={refreshPhotographer} />}
    </section>
  );
}

/* ── Booking Manager ─────────────────────── */
function BookingManager({ bookings, photographer, onRefresh }: { bookings: Booking[]; photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
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

/* ── Service Manager ─────────────────────── */
function ServiceManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const [services] = useState(photographer.services);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", durationMinutes: 60, price: 100, categoryId: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function startEdit(s: Service) {
    setEditing(s.id);
    setForm({ title: s.title, description: s.description, durationMinutes: s.durationMinutes, price: s.price, categoryId: s.category?.id ?? "" });
  }

  function resetForm() { setEditing(null); setShowCreate(false); setForm({ title: "", description: "", durationMinutes: 60, price: 100, categoryId: "" }); }

  async function save() {
    try {
      if (editing) {
        await api(`/me/services/${editing}`, { method: "PATCH", body: form });
        toast.success("Service updated.");
      } else {
        await api("/me/services", { method: "POST", body: form });
        toast.success("Service created.");
      }
      resetForm(); onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  async function toggleActive(s: Service) {
    await api(`/me/services/${s.id}`, { method: "PATCH", body: { isActive: !s.isActive } });
    toast.success(s.isActive ? "Service deactivated." : "Service activated.");
    onRefresh();
  }

  async function remove(id: string) {
    await api(`/me/services/${id}`, { method: "DELETE" });
    toast.success("Service deleted.");
    setConfirmDelete(null); onRefresh();
  }

  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>My Services ({services.length})</h2>
        {!showCreate && !editing && (
          <button className="solid-button compact" onClick={() => setShowCreate(true)}><Plus size={14} /> Add</button>
        )}
      </div>

      {(showCreate || editing) && (
        <div className="panel" style={{ display: "grid", gap: "12px" }}>
          <h3>{editing ? "Edit Service" : "New Service"}</h3>
          <div className="form-row">
            <label>Title <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {photographer.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          </div>
          <label>Description <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-row">
            <label>Duration (min) <input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></label>
            <label>Price ($) <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></label>
          </div>
          <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
            <button className="ghost-button compact" onClick={resetForm}><X size={14} /> Cancel</button>
            <button className="solid-button compact" onClick={save}><Save size={14} /> Save</button>
          </div>
        </div>
      )}

      <div className="list-stack">
        {services.map((s) => (
          <article className="panel service-row" key={s.id} style={{ opacity: s.isActive ? 1 : 0.55 }}>
            <div>
              <div className="card-title-row">
                <h3>{s.title}</h3>
                <span className={`tag ${s.isActive ? "tone-good" : "tone-neutral"}`}>{s.isActive ? "Active" : "Inactive"}</span>
              </div>
              <p>{s.description}</p>
              <p className="muted">{s.durationMinutes} min · {money(s.price)} · {s.category?.name ?? "No category"}</p>
            </div>
            <div className="inline-actions">
              <button className="ghost-button compact" onClick={() => toggleActive(s)} title={s.isActive ? "Deactivate" : "Activate"}>
                {s.isActive ? <EyeOff size={14} /> : <Camera size={14} />}
              </button>
              <button className="ghost-button compact" onClick={() => startEdit(s)}><Edit3 size={14} /></button>
              <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDelete(s.id)}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog open={!!confirmDelete} title="Delete Service" message="This will permanently remove this service. Existing bookings are not affected."
        confirmLabel="Delete" variant="danger" onConfirm={() => remove(confirmDelete!)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

/* ── Portfolio Manager ───────────────────── */
function PortfolioManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const items = photographer.portfolioItems;
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", categoryId: "", tags: "", isFeatured: false, sortOrder: 0 });
  const [editing, setEditing] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function startEdit(item: PortfolioItem) {
    setEditing(item.id);
    setForm({ title: item.title, description: item.description ?? "", imageUrl: item.imageUrl, categoryId: item.category?.id ?? "", tags: item.tags.join(","), isFeatured: item.isFeatured, sortOrder: item.sortOrder ?? 0 });
  }

  function resetForm() { setEditing(null); setShowCreate(false); setForm({ title: "", description: "", imageUrl: "", categoryId: "", tags: "", isFeatured: false, sortOrder: 0 }); }

  async function save() {
    try {
      const body = { ...form, tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [] };
      if (editing) {
        await api(`/portfolio/${editing}`, { method: "PATCH", body });
        toast.success("Portfolio item updated.");
      } else {
        await api("/portfolio", { method: "POST", body });
        toast.success("Portfolio item created.");
      }
      resetForm(); onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  async function remove(id: string) {
    await api(`/portfolio/${id}`, { method: "DELETE" });
    toast.success("Item deleted.");
    setConfirmDelete(null); onRefresh();
  }

  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>Portfolio ({items.length})</h2>
        {!showCreate && !editing && (
          <button className="solid-button compact" onClick={() => setShowCreate(true)}><Plus size={14} /> Add</button>
        )}
      </div>

      {(showCreate || editing) && (
        <div className="panel" style={{ display: "grid", gap: "12px" }}>
          <h3>{editing ? "Edit Item" : "New Portfolio Item"}</h3>
          <label>Title <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
          <label>Image URL <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></label>
          <label>Description <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
          <div className="form-row">
            <label>Category
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {photographer.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Tags (comma-separated) <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="wedding, outdoor" /></label>
          </div>
          <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} style={{ width: "auto" }} />
            Featured
          </label>
          <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
            <button className="ghost-button compact" onClick={resetForm}><X size={14} /> Cancel</button>
            <button className="solid-button compact" onClick={save}><Save size={14} /> Save</button>
          </div>
        </div>
      )}

      {items.length ? (
        <div className="portfolio-manager-grid">
          {items.map((item) => (
            <article className="portfolio-manager-card" key={item.id}>
              <img src={item.imageUrl} alt={item.title} />
              <div className="card-body">
                <h3>{item.title} {item.isFeatured && "⭐"}</h3>
                {item.isModerated && <span className="tag tone-warning">Awaiting moderation</span>}
                <div className="inline-actions" style={{ marginTop: "8px" }}>
                  <button className="ghost-button compact" onClick={() => startEdit(item)}><Edit3 size={14} /></button>
                  <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDelete(item.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Image size={32} />
          <h2>No portfolio items yet</h2>
          <p>Showcase your work to attract more clients.</p>
        </div>
      )}

      <ConfirmDialog open={!!confirmDelete} title="Delete Portfolio Item" message="This will permanently remove this item from your portfolio."
        confirmLabel="Delete" variant="danger" onConfirm={() => remove(confirmDelete!)} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

/* ── Availability Manager ────────────────── */
function AvailabilityManager({ photographer }: { photographer: Photographer; onRefresh: () => void }) {
  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>Availability Calendar</h2>
        <span className="muted" style={{ fontSize: "0.82rem" }}>Timezone: {photographer.timezone}</span>
      </div>
      <CalendarComponent />
    </div>
  );
}

/* ── Profile Manager ─────────────────────── */
function ProfileManager({ photographer, onRefresh }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    bio: photographer.bio,
    city: photographer.city,
    country: photographer.country,
    profileImageUrl: photographer.profileImageUrl ?? "",
    startingPrice: photographer.startingPrice,
    timezone: photographer.timezone,
    isPublished: photographer.isPublished,
  });

  async function save() {
    try {
      await api("/me/photographer", { method: "PATCH", body: form });
      toast.success("Profile updated.");
      onRefresh();
    } catch (err: any) { toast.error(err.message); }
  }

  return (
    <div className="content-stack" style={{ maxWidth: "620px" }}>
      <div className="panel" style={{ display: "grid", gap: "14px" }}>
        <h2>Profile Settings</h2>

        <label>Bio <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label>

        <div className="form-row">
          <label>City <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
          <label>Country <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
        </div>

        <label>Profile Image URL <input value={form.profileImageUrl} onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })} placeholder="https://..." /></label>

        <div className="form-row">
          <label>Starting Price ($) <input type="number" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })} /></label>
          <label>Timezone <input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></label>
        </div>

        <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} style={{ width: "auto" }} />
          Published (visible in search)
        </label>

        <div className="card-title-row">
          <span className="muted">Verified: {photographer.verified ? "✅ Yes" : "❌ No (contact admin)"}</span>
          <span className="muted">Rating: ⭐ {photographer.rating} ({photographer.reviewCount} reviews)</span>
        </div>

        <button className="solid-button" onClick={save}><Save size={16} /> Save Profile</button>
      </div>
    </div>
  );
}
