import {
  BarChart3, BookOpen, Calendar, Camera, Edit3, EyeOff,
  Grid3X3, Image, ImageOff, MessageCircle, Package, Pencil, Plus, Save, Settings, Star, Trash2, X
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarComponent } from "../../components/calendar/Calendar";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { StatusBadge } from "../../components/StatusBadge";
import { useToast } from "../../components/shared/Toast";
import { useAuth } from "../../hooks/useAuth";
import { api, money, shortDate, type AvailabilityRule, type Booking, type CalendarBlock, type Photographer, type PortfolioItem, type Service } from "../../lib/api";

type Tab = "bookings" | "services" | "portfolio" | "availability" | "analytics" | "profile";

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
    { key: "analytics", label: "Analytics", icon: <BarChart3 size={15} /> },
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
      {activeTab === "analytics" && <AnalyticsPanel bookings={bookings} photographer={photographer} />}
      {activeTab === "profile" && <ProfileManager photographer={photographer} onRefresh={refreshPhotographer} />}
    </section>
  );
}

/* ── Booking Manager ─────────────────────── */
function BookingManager({ bookings, photographer, onRefresh }: { bookings: Booking[]; photographer: Photographer; onRefresh: () => void }) {
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
  const [previewFailed, setPreviewFailed] = useState(false);

  function startEdit(item: PortfolioItem) {
    setEditing(item.id);
    setPreviewFailed(false);
    setForm({ title: item.title, description: item.description ?? "", imageUrl: item.imageUrl, categoryId: item.category?.id ?? "", tags: item.tags.join(","), isFeatured: item.isFeatured, sortOrder: item.sortOrder ?? 0 });
  }

  function resetForm() { setEditing(null); setShowCreate(false); setPreviewFailed(false); setForm({ title: "", description: "", imageUrl: "", categoryId: "", tags: "", isFeatured: false, sortOrder: 0 }); }

  function handleImageUrlChange(url: string) {
    setForm({ ...form, imageUrl: url });
    setPreviewFailed(false);
  }

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
          <div style={{ display: "grid", gap: "8px" }}>
            <label>Image URL <input value={form.imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} placeholder="https://..." /></label>
            {form.imageUrl && !previewFailed && (
              <img
                src={form.imageUrl}
                alt="Preview"
                style={{ maxWidth: "300px", maxHeight: "200px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                onError={() => setPreviewFailed(true)}
              />
            )}
            {form.imageUrl && previewFailed && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "var(--surface-muted)", borderRadius: "8px", color: "var(--muted-foreground)", fontSize: "0.88rem" }}>
                <ImageOff size={16} /> Unable to load image preview
              </div>
            )}
          </div>
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
              <ItemImage src={item.imageUrl} alt={item.title} />
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

function ItemImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "160px", background: "var(--surface-muted)", color: "var(--muted-foreground)", fontSize: "0.82rem", gap: "6px" }}>
        <ImageOff size={18} /> No preview
      </div>
    );
  }
  return <img src={src} alt={alt} onError={() => setFailed(true)} />;
}

/* ── Availability Manager ────────────────── */
/* ── Availability Manager ────────────────── */
function AvailabilityManager({ photographer }: { photographer: Photographer; onRefresh: () => void }) {
  const toast = useToast();
  const [rules, setRules] = useState<AvailabilityRule[]>([]);
  const [blocks, setBlocks] = useState<CalendarBlock[]>([]);
  const [loaded, setLoaded] = useState(false);

  type RuleForm = { dayOfWeek: number; startTime: string; endTime: string };
  const [ruleForm, setRuleForm] = useState<RuleForm>({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" });
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showAddRule, setShowAddRule] = useState(false);
  const [confirmDeleteRule, setConfirmDeleteRule] = useState<string | null>(null);

  type BlockForm = { startAt: string; endAt: string; reason: string };
  const [blockForm, setBlockForm] = useState<BlockForm>({ startAt: "", endAt: "", reason: "" });
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [confirmDeleteBlock, setConfirmDeleteBlock] = useState<string | null>(null);

  useEffect(() => { fetchAvailability(); }, []);

  async function fetchAvailability() {
    try {
      const res = await api<{ rules: AvailabilityRule[]; blocks: CalendarBlock[] }>("/me/availability");
      setRules(res.data.rules);
      setBlocks(res.data.blocks);
    } catch { /* auth-guarded */ } finally { setLoaded(true); }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function formatBlockDate(iso: string) {
    return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(iso));
  }

  /* ── Rule actions ── */
  function startAddRule() { setShowAddRule(true); setEditingRuleId(null); setRuleForm({ dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }); }
  function startEditRule(r: AvailabilityRule) { setEditingRuleId(r.id); setShowAddRule(false); setRuleForm({ dayOfWeek: r.dayOfWeek, startTime: r.startTime, endTime: r.endTime }); }
  function cancelRuleForm() { setEditingRuleId(null); setShowAddRule(false); }

  async function saveRule() {
    try {
      if (editingRuleId) {
        await api(`/me/availability/${editingRuleId}`, { method: "PATCH", body: ruleForm });
        toast.success("Rule updated.");
      } else {
        await api("/me/availability", { method: "POST", body: ruleForm });
        toast.success("Rule added.");
      }
      cancelRuleForm(); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  async function toggleRule(r: AvailabilityRule) {
    try {
      await api(`/me/availability/${r.id}`, { method: "PATCH", body: { isActive: !r.isActive } });
      toast.success(r.isActive ? "Rule deactivated." : "Rule activated.");
      fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteRule(id: string) {
    try {
      await api(`/me/availability/${id}`, { method: "DELETE" });
      toast.success("Rule deleted.");
      setConfirmDeleteRule(null); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  /* ── Block actions ── */
  function startAddBlock() { setShowAddBlock(true); setBlockForm({ startAt: "", endAt: "", reason: "" }); }

  async function saveBlock() {
    try {
      await api("/me/calendar-blocks", { method: "POST", body: { startAt: new Date(blockForm.startAt).toISOString(), endAt: new Date(blockForm.endAt).toISOString(), reason: blockForm.reason || undefined } });
      toast.success("Block created.");
      setShowAddBlock(false); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  async function deleteBlock(id: string) {
    try {
      await api(`/me/calendar-blocks/${id}`, { method: "DELETE" });
      toast.success("Block removed.");
      setConfirmDeleteBlock(null); fetchAvailability();
    } catch (err: any) { toast.error(err.message); }
  }

  if (!loaded) return <div className="panel">Loading availability...</div>;

  return (
    <div className="content-stack">
      <div className="split-heading compact-heading">
        <h2>Availability Calendar</h2>
        <span className="muted" style={{ fontSize: "0.82rem" }}>Timezone: {photographer.timezone}</span>
      </div>
      <CalendarComponent />

      {/* ── Weekly Rules ── */}
      <div className="content-stack" style={{ marginTop: "8px" }}>
        <div className="split-heading compact-heading">
          <h3>Weekly Rules ({rules.length})</h3>
          {!showAddRule && !editingRuleId && (
            <button className="solid-button compact" onClick={startAddRule}><Plus size={14} /> Add Rule</button>
          )}
        </div>

        {(showAddRule || editingRuleId) && (
          <div className="panel" style={{ display: "grid", gap: "10px" }}>
            <h4>{editingRuleId ? "Edit Rule" : "New Rule"}</h4>
            <div className="form-row">
              <label>Day
                <select value={ruleForm.dayOfWeek} onChange={(e) => setRuleForm({ ...ruleForm, dayOfWeek: Number(e.target.value) })}>
                  {dayNames.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              </label>
              <label>Start <input type="time" value={ruleForm.startTime} onChange={(e) => setRuleForm({ ...ruleForm, startTime: e.target.value })} /></label>
              <label>End <input type="time" value={ruleForm.endTime} onChange={(e) => setRuleForm({ ...ruleForm, endTime: e.target.value })} /></label>
            </div>
            <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
              <button className="ghost-button compact" onClick={cancelRuleForm}><X size={14} /> Cancel</button>
              <button className="solid-button compact" onClick={saveRule}><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        {rules.length ? (
          <div className="list-stack">
            {rules.map((r) => (
              <article className="panel service-row" key={r.id} style={{ opacity: r.isActive ? 1 : 0.55 }}>
                <div>
                  <div className="card-title-row">
                    <strong>{dayNames[r.dayOfWeek]}s</strong>
                    <span className={`tag ${r.isActive ? "tone-good" : "tone-neutral"}`}>{r.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="muted">{r.startTime} — {r.endTime}</p>
                </div>
                <div className="inline-actions">
                  <button className="ghost-button compact" onClick={() => toggleRule(r)} title={r.isActive ? "Deactivate" : "Activate"}>
                    <EyeOff size={14} />
                  </button>
                  <button className="ghost-button compact" onClick={() => startEditRule(r)}><Pencil size={14} /></button>
                  <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDeleteRule(r.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel muted">No weekly rules yet. Add a rule to define your recurring availability.</div>
        )}
      </div>

      {/* ── Calendar Blocks ── */}
      <div className="content-stack" style={{ marginTop: "8px" }}>
        <div className="split-heading compact-heading">
          <h3>Blocked Dates ({blocks.length})</h3>
          {!showAddBlock && (
            <button className="solid-button compact" onClick={startAddBlock}><Plus size={14} /> Block Dates</button>
          )}
        </div>

        {showAddBlock && (
          <div className="panel" style={{ display: "grid", gap: "10px" }}>
            <h4>New Block</h4>
            <div className="form-row">
              <label>Start <input type="datetime-local" value={blockForm.startAt} onChange={(e) => setBlockForm({ ...blockForm, startAt: e.target.value })} /></label>
              <label>End <input type="datetime-local" value={blockForm.endAt} onChange={(e) => setBlockForm({ ...blockForm, endAt: e.target.value })} /></label>
            </div>
            <label>Reason (optional) <input value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder="Vacation, personal day..." /></label>
            <div className="inline-actions" style={{ justifyContent: "flex-end" }}>
              <button className="ghost-button compact" onClick={() => setShowAddBlock(false)}><X size={14} /> Cancel</button>
              <button className="solid-button compact" onClick={saveBlock}><Save size={14} /> Save</button>
            </div>
          </div>
        )}

        {blocks.length ? (
          <div className="list-stack">
            {blocks.map((b) => (
              <article className="panel service-row" key={b.id}>
                <div>
                  <strong>{formatBlockDate(b.startAt)} — {formatBlockDate(b.endAt)}</strong>
                  {b.reason && <p className="muted" style={{ marginTop: "4px" }}>{b.reason}</p>}
                </div>
                <div className="inline-actions">
                  <button className="ghost-button compact" style={{ color: "var(--red)" }} onClick={() => setConfirmDeleteBlock(b.id)}><Trash2 size={14} /></button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel muted">No blocked dates. Block dates when you're on vacation or unavailable.</div>
        )}
      </div>

      <ConfirmDialog open={!!confirmDeleteRule} title="Delete Rule" message="This will permanently remove this availability rule."
        confirmLabel="Delete" variant="danger" onConfirm={() => deleteRule(confirmDeleteRule!)} onCancel={() => setConfirmDeleteRule(null)} />
      <ConfirmDialog open={!!confirmDeleteBlock} title="Delete Block" message="This will permanently remove this calendar block."
        confirmLabel="Delete" variant="danger" onConfirm={() => deleteBlock(confirmDeleteBlock!)} onCancel={() => setConfirmDeleteBlock(null)} />
    </div>
  );
}

/* ── Analytics Panel ──────────────────────── */
function AnalyticsPanel({ bookings, photographer }: { bookings: Booking[]; photographer: Photographer }) {
  const my = bookings.filter((b) => b.photographer.id === photographer.id);

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalEarnings = my.reduce((sum, b) => sum + b.priceEstimate, 0);
  const monthEarnings = my
    .filter((b) => b.status !== "CANCELLED" && new Date(b.createdAt) >= thisMonthStart)
    .reduce((sum, b) => sum + b.priceEstimate, 0);
  const pendingEarnings = my
    .filter((b) => b.status === "CONFIRMED")
    .reduce((sum, b) => sum + b.priceEstimate, 0);

  const statusCounts = { PENDING: 0, CONFIRMED: 0, COMPLETED: 0, CANCELLED: 0 };
  my.forEach((b) => { statusCounts[b.status]++; });

  const serviceStats = new Map<string, { title: string; count: number; revenue: number }>();
  my.forEach((b) => {
    const s = serviceStats.get(b.service.id) || { title: b.service.title ?? "Unknown", count: 0, revenue: 0 };
    s.count++;
    s.revenue += b.priceEstimate;
    serviceStats.set(b.service.id, s);
  });
  const topServices = [...serviceStats.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  const monthLabels: string[] = [];
  const monthData: { bookings: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push(new Intl.DateTimeFormat("en-CA", { month: "short", year: "2-digit" }).format(d));
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const monthBookings = my.filter((b) => {
      const date = new Date(b.createdAt);
      return date >= start && date <= end;
    });
    monthData.push({
      bookings: monthBookings.length,
      revenue: monthBookings.reduce((sum, b) => sum + b.priceEstimate, 0)
    });
  }

  return (
    <div className="content-stack">
      <div className="dashboard-grid">
        <div className="panel stat-card">
          <span className="muted" style={{ fontSize: "0.82rem" }}>Total Earnings</span>
          <strong style={{ fontSize: "1.5rem" }}>{money(totalEarnings)}</strong>
        </div>
        <div className="panel stat-card">
          <span className="muted" style={{ fontSize: "0.82rem" }}>This Month</span>
          <strong style={{ fontSize: "1.5rem" }}>{money(monthEarnings)}</strong>
        </div>
        <div className="panel stat-card">
          <span className="muted" style={{ fontSize: "0.82rem" }}>Pending (Confirmed)</span>
          <strong style={{ fontSize: "1.5rem" }}>{money(pendingEarnings)}</strong>
        </div>
      </div>

      <div className="panel" style={{ display: "grid", gap: "10px" }}>
        <h3>Booking Status</h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} style={{ textAlign: "center", minWidth: "80px" }}>
              <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{count}</div>
              <StatusBadge value={status} />
            </div>
          ))}
        </div>
      </div>

      {topServices.length > 0 && (
        <div className="panel" style={{ display: "grid", gap: "10px" }}>
          <h3>Top Services</h3>
          <div className="table-list">
            {topServices.map((s, i) => (
              <div className="table-row" key={i} style={{ gridTemplateColumns: "1fr auto auto" }}>
                <span>{s.title}</span>
                <span className="muted">{s.count} bookings</span>
                <strong>{money(s.revenue)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="panel" style={{ display: "grid", gap: "10px" }}>
        <h3>Monthly Trend</h3>
        <div className="table-list">
          {monthLabels.map((label, i) => (
            <div className="table-row" key={i} style={{ gridTemplateColumns: "1fr auto auto" }}>
              <span>{label}</span>
              <span className="muted">{monthData[i].bookings} bookings</span>
              <strong>{money(monthData[i].revenue)}</strong>
            </div>
          ))}
        </div>
      </div>
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
