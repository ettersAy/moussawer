import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarClock,
  Camera,
  CheckCircle2,
  FileWarning,
  Plus,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "../components/StatusBadge";
import { useAuth } from "../contexts/AuthContext";
import { api, shortDate, type Booking, type CaseItem, type User } from "../lib/api";

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

type ActivityLog = {
  id: string;
  actor: { id: string; name: string; role: string } | null;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type Tab = "overview" | "users" | "incidents" | "disputes" | "categories" | "activity";

export function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [allIncidents, setAllIncidents] = useState<CaseItem[]>([]);
  const [allDisputes, setAllDisputes] = useState<CaseItem[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    loadStats();
    loadUsers();
    loadIncidents();
    loadDisputes();
    loadActivity();
  }, []);

  async function loadStats() {
    try {
      const response = await api<AdminStats>("/admin/stats");
      setStats(response.data);
    } catch { /* admins only */ }
  }

  async function loadUsers() {
    try {
      const response = await api<User[]>("/admin/users");
      setUsers(response.data);
    } catch { /* admins only */ }
  }

  async function loadIncidents() {
    try {
      const response = await api<CaseItem[]>("/incidents");
      setAllIncidents(response.data);
    } catch { /* auth required */ }
  }

  async function loadDisputes() {
    try {
      const response = await api<CaseItem[]>("/disputes");
      setAllDisputes(response.data);
    } catch { /* auth required */ }
  }

  async function loadActivity() {
    try {
      const response = await api<ActivityLog[]>("/admin/activity");
      setLogs(response.data);
    } catch { /* admins only */ }
  }

  async function updateUserStatus(targetUser: User, status: string) {
    await api<User>(`/admin/users/${targetUser.id}`, { method: "PATCH", body: { status } });
    loadUsers();
  }

  async function updateIncident(incident: CaseItem, status: string) {
    await api<CaseItem>(`/admin/incidents/${incident.id}`, { method: "PATCH", body: { status } });
    loadIncidents();
  }

  async function updateDispute(dispute: CaseItem, status: string) {
    await api<CaseItem>(`/admin/disputes/${dispute.id}`, { method: "PATCH", body: { status } });
    loadDisputes();
  }

  async function createCategory(event: React.FormEvent) {
    event.preventDefault();
    if (!categoryName.trim()) return;
    await api("/admin/categories", { method: "POST", body: { name: categoryName } });
    setCategoryName("");
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 size={16} /> },
    { key: "users", label: "Users", icon: <Users size={16} /> },
    { key: "incidents", label: "Incidents", icon: <FileWarning size={16} /> },
    { key: "disputes", label: "Disputes", icon: <ShieldAlert size={16} /> },
    { key: "categories", label: "Categories", icon: <Plus size={16} /> },
    { key: "activity", label: "Activity", icon: <Activity size={16} /> }
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
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon}
            {tab.label}
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
          {(stats.moderationQueue > 0) && (
            <div className="panel tone-warning" style={{ marginTop: "1rem" }}>
              <div className="card-title-row">
                <Shield size={18} />
                <strong>Moderation queue: {stats.moderationQueue} portfolio item(s) flagged</strong>
              </div>
              <p className="muted">Items awaiting moderation review before being published.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "overview" && !stats && (
        <div className="panel">
          <p className="muted">Loading stats...</p>
        </div>
      )}

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
                      <button
                        className="ghost-button compact"
                        type="button"
                        onClick={() => updateUserStatus(u, "SUSPENDED")}
                        title="Suspend user"
                      >
                        <UserX size={15} /> Suspend
                      </button>
                    ) : (
                      <button
                        className="ghost-button compact"
                        type="button"
                        onClick={() => updateUserStatus(u, "ACTIVE")}
                        title="Activate user"
                      >
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
                      <button className="ghost-button compact" type="button" onClick={() => updateIncident(incident, "UNDER_REVIEW")}>
                        <CheckCircle2 size={15} /> Review
                      </button>
                    )}
                    {incident.status === "UNDER_REVIEW" && (
                      <button className="ghost-button compact" type="button" onClick={() => updateIncident(incident, "RESOLVED")}>
                        <CheckCircle2 size={15} /> Resolve
                      </button>
                    )}
                    {incident.status !== "CLOSED" && incident.status !== "RESOLVED" && (
                      <button className="ghost-button compact" type="button" onClick={() => updateIncident(incident, "CLOSED")}>
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
                      <button className="ghost-button compact" type="button" onClick={() => updateDispute(dispute, "UNDER_REVIEW")}>
                        <CheckCircle2 size={15} /> Review
                      </button>
                    )}
                    {dispute.status === "UNDER_REVIEW" && (
                      <>
                        <button className="ghost-button compact" type="button" onClick={() => updateDispute(dispute, "RESOLVED")}>
                          <CheckCircle2 size={15} /> Resolve
                        </button>
                        <button className="ghost-button compact" type="button" onClick={() => updateDispute(dispute, "REJECTED")}>
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

      {activeTab === "categories" && (
        <div className="admin-section">
          <section className="panel">
            <h2>Create a new category</h2>
            <form className="inline-form" onSubmit={createCategory}>
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Category name"
              />
              <button className="solid-button compact" type="submit">
                <Plus size={15} /> Create
              </button>
            </form>
            <p className="muted" style={{ marginTop: "0.5rem" }}>
              New categories are available immediately for photographers and portfolio items.
            </p>
          </section>
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
                    <span className="tone-neutral" style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "4px" }}>
                      {log.entity}
                    </span>
                  </div>
                  <p>
                    {log.actor ? (
                      <>
                        by <strong>{log.actor.name}</strong> ({log.actor.role.toLowerCase()})
                      </>
                    ) : (
                      <>by <strong>System</strong></>
                    )}
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
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}
