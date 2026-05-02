import {
  Activity, AlertTriangle, BarChart3, BookOpen, CalendarClock, Camera,
  CheckCircle2, Edit3, FileWarning, Grid3X3, Plus,
  Shield, ShieldAlert, Trash2, UserCheck, UserX, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../components/shared/Toast";
import { useAuth } from "../contexts/AuthContext";
import { api, money, shortDate, type Booking, type CaseItem, type PortfolioItem, type User } from "../lib/api";

type AdminStats = {
  totalUsers: number; totalPhotographers: number; totalClients: number;
  totalBookings: number; pendingBookings: number; openIncidents: number;
  openDisputes: number; recentMessages: number; moderationQueue: number;
};

type ActivityLog = {
  id: string; actor: { id: string; name: string; role: string } | null;
  action: string; entity: string; entityId: string; metadata: Record<string, unknown>; createdAt: string;
};

type AdminCategory = { id: string; name: string; slug: string; _count: { photographers: number; services: number; portfolio: number } };

type Tab = "overview" | "users" | "bookings" | "incidents" | "disputes" | "moderation" | "categories" | "activity";

export function AdminPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allIncidents, setAllIncidents] = useState<CaseItem[]>([]);
  const [allDisputes, setAllDisputes] = useState<CaseItem[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [bookingFilter, setBookingFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { loadStats(); loadUsers(); loadIncidents(); loadDisputes(); loadActivity(); }, []);

  async function loadStats() {
    try { const r = await api<AdminStats>("/admin/stats"); setStats(r.data); } catch { /* admin only */ }
  }
  async function loadUsers() {
    try { const r = await api<User[]>("/admin/users"); setUsers(r.data); } catch { /* admin only */ }
  }
  async function loadBookings() {
    const qs = bookingFilter ? `?status=${bookingFilter}` : "";
    try { const r = await api<Booking[]>(`/admin/bookings${qs}`); setBookings(r.data); } catch { /* admin only */ }
  }
  async function loadIncidents() {
    try { const r = await api<CaseItem[]>("/incidents"); setAllIncidents(r.data); } catch { /* admin only */ }
  }
  async function loadDisputes() {
    try { const r = await api<CaseItem[]>("/disputes"); setAllDisputes(r.data); } catch { /* admin only */ }
  }
  async function loadPortfolio() {
    try { const r = await api<PortfolioItem[]>("/portfolio"); setPortfolio(r.data); } catch { /* admin only */ }
  }
  async function loadCategories() {
    try {
      const r = await api<AdminCategory[]>("/admin/categories");
      setCategories(r.data);
    } catch { /* admin only */ }
  }
  async function loadActivity() {
    try { const r = await api<ActivityLog[]>("/admin/activity"); setLogs(r.data); } catch { /* admin only */ }
  }

  async function updateUserStatus(targetUser: User, status: string) {
    await api(`/admin/users/${targetUser.id}`, { method: "PATCH", body: { status } });
    toast.success(`User ${status.toLowerCase()}.`);
    loadUsers();
  }

  async function updateIncident(incident: CaseItem, status: string) {
    await api(`/admin/incidents/${incident.id}`, { method: "PATCH", body: { status } });
    toast.success(`Incident ${status.toLowerCase()}.`);
    loadIncidents();
  }

  async function updateDispute(dispute: CaseItem, status: string) {
    await api(`/admin/disputes/${dispute.id}`, { method: "PATCH", body: { status } });
    toast.success(`Dispute ${status.toLowerCase()}.`);
    loadDisputes();
  }

  async function updateBookingStatus(booking: Booking, status: string) {
    await api(`/bookings/${booking.id}/status`, { method: "PATCH", body: { status } });
    toast.success(`Booking ${status.toLowerCase()}.`);
    loadBookings();
  }

  async function moderatePortfolio(id: string, isModerated: boolean) {
    await api(`/portfolio/${id}`, { method: "PATCH", body: { isModerated } });
    toast.success(isModerated ? "Item flagged for moderation." : "Item approved.");
    loadPortfolio();
  }

  async function createCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    await api("/admin/categories", { method: "POST", body: { name: categoryName } });
    toast.success("Category created.");
    setCategoryName("");
    loadCategories();
  }

  async function updateCategory(id: string) {
    if (!editCatName.trim()) return;
    await api(`/admin/categories/${id}`, { method: "PATCH", body: { name: editCatName } });
    toast.success("Category updated.");
    setEditingCat(null);
    loadCategories();
  }

  async function deleteCategory(id: string) {
    try {
      await api(`/admin/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted.");
    } catch (err: any) { toast.error(err.message); }
    setConfirmDelete(null);
    loadCategories();
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { key: "users", label: "Users", icon: <Users size={16} /> },
    { key: "bookings", label: "Bookings", icon: <BookOpen size={16} /> },
    { key: "incidents", label: "Incidents", icon: <FileWarning size={16} /> },
    { key: "disputes", label: "Disputes", icon: <ShieldAlert size={16} /> },
    { key: "moderation", label: "Moderation", icon: <Grid3X3 size={16} /> },
    { key: "categories", label: "Categories", icon: <Plus size={16} /> },
    { key: "activity", label: "Activity", icon: <Activity size={16} /> },
  ];

  return (
    <section className="page admin-page">
      <div className="split-heading">
        <div>
          <span className="eyebrow">Admin panel</span>
          <h1>Manage your platform, {user?.name}.</h1>
        </div>
      </div>

      <nav className="admin-tabs" aria-label="Admin sections">
        {tabs.map((tab) => (
          <button key={tab.key} type="button"
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === "bookings") loadBookings();
              if (tab.key === "moderation") loadPortfolio();
              if (tab.key === "categories") loadCategories();
            }}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && stats && (
        <div className="admin-section">
          <div className="metrics-grid">
            <Metric icon={<Users />} label="Total users" value={stats.totalUsers} />
            <Metric icon={<Camera />} label="Photographers" value={stats.totalPhotographers} />
            <Metric icon={<UserCheck />} label="Clients" value={stats.totalClients} />
            <Metric icon={<CalendarClock />} label="Total bookings" value={stats.totalBookings} />
            <Metric icon={<CalendarClock />} label="Pending bookings" value={stats.pendingBookings} />
            <Metric icon={<FileWarning />} label="Open incidents" value={stats.openIncidents} />
            <Metric icon={<ShieldAlert />} label="Open disputes" value={stats.openDisputes} />
            <Metric icon={<Activity />} label="Messages sent" value={stats.recentMessages} />
          </div>
          {stats.moderationQueue > 0 && (
            <div className="panel tone-warning" style={{ marginTop: "1rem" }}>
              <div className="card-title-row">
                <Shield size={18} /><strong>Moderation queue: {stats.moderationQueue} portfolio item(s)</strong>
              </div>
              <p className="muted">Items awaiting moderation review before being published.</p>
            </div>
          )}
        </div>
      )}
      {activeTab === "overview" && !stats && <div className="panel"><p className="muted">Loading stats...</p></div>}

      {activeTab === "users" && (
        <div className="admin-section">
          <section className="panel">
            <h2>All users ({users.length})</h2>
            <div className="table-list">
              {users.map((u) => (
                <div className="table-row" key={u.id}>
                  <div>
                    <strong>{u.name}</strong>
                    <p>{u.email} · {u.role.toLowerCase()}</p>
                  </div>
                  <StatusBadge value={u.status} />
                  <div className="inline-actions">
                    {u.status === "ACTIVE" ? (
                      <button className="ghost-button compact" onClick={() => updateUserStatus(u, "SUSPENDED")}>
                        <UserX size={15} /> Suspend
                      </button>
                    ) : (
                      <button className="ghost-button compact" onClick={() => updateUserStatus(u, "ACTIVE")}>
                        <UserCheck size={15} /> Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="admin-section">
          <section className="panel">
            <div className="split-heading compact-heading">
              <h2>Bookings ({bookings.length})</h2>
              <select value={bookingFilter} onChange={(e) => { setBookingFilter(e.target.value); setTimeout(loadBookings, 0); }}>
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
                      <button className="ghost-button compact" onClick={() => updateBookingStatus(b, "CANCELLED")}>
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
      )}

      {activeTab === "incidents" && (
        <div className="admin-section">
          <section className="panel">
            <h2>Incidents ({allIncidents.length})</h2>
            <div className="table-list">
              {allIncidents.map((incident) => (
                <div className="table-row" key={incident.id}>
                  <div>
                    <strong>{incident.category}</strong>
                    <p>{incident.description.slice(0, 80)}{incident.description.length > 80 ? "…" : ""}</p>
                    <p className="muted">Reported by {incident.reporter.name} · {shortDate(incident.createdAt)}</p>
                  </div>
                  <StatusBadge value={incident.status} />
                  <div className="inline-actions">
                    {incident.status === "OPEN" && (
                      <button className="ghost-button compact" onClick={() => updateIncident(incident, "UNDER_REVIEW")}>
                        <CheckCircle2 size={15} /> Review
                      </button>
                    )}
                    {incident.status === "UNDER_REVIEW" && (
                      <button className="ghost-button compact" onClick={() => updateIncident(incident, "RESOLVED")}>
                        <CheckCircle2 size={15} /> Resolve
                      </button>
                    )}
                    {incident.status !== "CLOSED" && incident.status !== "RESOLVED" && (
                      <button className="ghost-button compact" onClick={() => updateIncident(incident, "CLOSED")}>
                        <AlertTriangle size={15} /> Close
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!allIncidents.length && <p className="muted">No incidents reported.</p>}
            </div>
          </section>
        </div>
      )}

      {activeTab === "disputes" && (
        <div className="admin-section">
          <section className="panel">
            <h2>Disputes ({allDisputes.length})</h2>
            <div className="table-list">
              {allDisputes.map((dispute) => (
                <div className="table-row" key={dispute.id}>
                  <div>
                    <strong>{dispute.type}</strong>
                    <p>{dispute.description.slice(0, 80)}{dispute.description.length > 80 ? "…" : ""}</p>
                    <p className="muted">Reported by {dispute.reporter.name} · {shortDate(dispute.createdAt)}</p>
                  </div>
                  <StatusBadge value={dispute.status} />
                  <div className="inline-actions">
                    {(dispute.status === "OPEN" || dispute.status === "AWAITING_RESPONSE") && (
                      <button className="ghost-button compact" onClick={() => updateDispute(dispute, "UNDER_REVIEW")}>
                        <CheckCircle2 size={15} /> Review
                      </button>
                    )}
                    {dispute.status === "UNDER_REVIEW" && (
                      <>
                        <button className="ghost-button compact" onClick={() => updateDispute(dispute, "RESOLVED")}>
                          <CheckCircle2 size={15} /> Resolve
                        </button>
                        <button className="ghost-button compact" onClick={() => updateDispute(dispute, "REJECTED")}>
                          <AlertTriangle size={15} /> Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {!allDisputes.length && <p className="muted">No disputes filed.</p>}
            </div>
          </section>
        </div>
      )}

      {activeTab === "moderation" && (
        <div className="admin-section">
          <section className="panel">
            <h2>Portfolio Moderation ({portfolio.filter((p) => p.isModerated).length} flagged)</h2>
            <div className="portfolio-manager-grid">
              {portfolio.filter((p) => !p.isModerated).length === 0 && portfolio.length === 0 && (
                <p className="muted" style={{ gridColumn: "1/-1" }}>No portfolio items to moderate.</p>
              )}
              {portfolio.map((item) => (
                <article className="portfolio-manager-card" key={item.id}>
                  <img src={item.imageUrl} alt={item.title} />
                  <div className="card-body">
                    <h3>{item.title}</h3>
                    <div className="inline-actions" style={{ marginTop: "8px" }}>
                      {item.isModerated ? (
                        <button className="ghost-button compact tone-good" onClick={() => moderatePortfolio(item.id, false)}>
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      ) : (
                        <button className="ghost-button compact tone-warning" onClick={() => moderatePortfolio(item.id, true)}>
                          <AlertTriangle size={14} /> Flag
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === "categories" && (
        <div className="admin-section">
          <section className="panel">
            <h2>Create a new category</h2>
            <form className="inline-form" onSubmit={createCategory}>
              <input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Category name" />
              <button className="solid-button compact" type="submit"><Plus size={15} /> Create</button>
            </form>
          </section>
          <section className="panel" style={{ marginTop: "1rem" }}>
            <h2>Existing categories ({categories.length})</h2>
            <div className="table-list">
              {categories.map((cat) => (
                <div className="table-row" key={cat.id}>
                  <div>
                    {editingCat === cat.id ? (
                      <div className="inline-actions">
                        <input value={editCatName} onChange={(e) => setEditCatName(e.target.value)} style={{ minWidth: "200px" }} />
                        <button className="solid-button compact" onClick={() => updateCategory(cat.id)}><CheckCircle2 size={14} /> Save</button>
                        <button className="ghost-button compact" onClick={() => setEditingCat(null)}>Cancel</button>
                      </div>
                    ) : (
                      <strong>{cat.name}</strong>
                    )}
                    <p className="muted">{cat._count.photographers} photographers · {cat._count.services} services · {cat._count.portfolio} items</p>
                  </div>
                  <div className="inline-actions">
                    <button className="ghost-button compact" onClick={() => { setEditingCat(cat.id); setEditCatName(cat.name); }}>
                      <Edit3 size={14} />
                    </button>
                    <button className="ghost-button compact" style={{ color: "var(--red)" }}
                      onClick={() => setConfirmDelete(cat.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              {!categories.length && <p className="muted">No categories yet.</p>}
            </div>
          </section>
          <ConfirmDialog open={!!confirmDelete} title="Delete Category"
            message="This will permanently delete this category if no photographers are assigned."
            confirmLabel="Delete" variant="danger"
            onConfirm={() => deleteCategory(confirmDelete!)}
            onCancel={() => setConfirmDelete(null)} />
        </div>
      )}

      {activeTab === "activity" && (
        <div className="admin-section">
          <section className="panel">
            <h2>Recent activity</h2>
            <div className="list-stack">
              {logs.map((log) => (
                <article className="soft-row" key={log.id}>
                  <div className="card-title-row">
                    <strong>{log.action}</strong>
                    <span className="tone-neutral" style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px" }}>{log.entity}</span>
                  </div>
                  <p>
                    {log.actor ? <>by <strong>{log.actor.name}</strong> ({log.actor.role.toLowerCase()})</> : <>by <strong>System</strong></>}
                    {" · "}{shortDate(log.createdAt)}
                  </p>
                  {Object.keys(log.metadata).length > 0 && (
                    <pre className="muted" style={{ fontSize: "0.78rem", margin: "4px 0 0", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(log.metadata, null, 1)}
                    </pre>
                  )}
                </article>
              ))}
              {!logs.length && <p className="muted">No activity logged yet.</p>}
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <div><strong>{value}</strong><p>{label}</p></div>
    </article>
  );
}
