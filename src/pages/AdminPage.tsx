import {
  Activity, BarChart3, BookOpen, FileWarning, Grid3X3, Plus, ShieldAlert, Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "../components/shared/Toast";
import { useAuth } from "../contexts/AuthContext";
import { api, type Booking, type CaseItem, type PortfolioItem, type User } from "../lib/api";
import { ActivityTab } from "./admin/ActivityTab";
import { BookingsTab } from "./admin/BookingsTab";
import { CategoriesTab } from "./admin/CategoriesTab";
import { DisputesTab } from "./admin/DisputesTab";
import { IncidentsTab } from "./admin/IncidentsTab";
import { ModerationTab } from "./admin/ModerationTab";
import { OverviewTab } from "./admin/OverviewTab";
import { UsersTab } from "./admin/UsersTab";

type AdminStats = {
  totalUsers: number; totalPhotographers: number; totalClients: number;
  totalBookings: number; pendingBookings: number; openIncidents: number;
  openDisputes: number; recentMessages: number; moderationQueue: number;
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
  const [bookingFilter, setBookingFilter] = useState("");

  type ActivityLog = {
    id: string; actor: { id: string; name: string; role: string } | null;
    action: string; entity: string; entityId: string; metadata: Record<string, unknown>; createdAt: string;
  };

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
    try { const r = await api<AdminCategory[]>("/admin/categories"); setCategories(r.data); } catch { /* admin only */ }
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

  async function createCategory(name: string) {
    await api("/admin/categories", { method: "POST", body: { name } });
    toast.success("Category created.");
    loadCategories();
  }

  async function updateCategory(id: string, name: string) {
    await api(`/admin/categories/${id}`, { method: "PATCH", body: { name } });
    toast.success("Category updated.");
    loadCategories();
  }

  async function deleteCategory(id: string) {
    try {
      await api(`/admin/categories/${id}`, { method: "DELETE" });
      toast.success("Category deleted.");
    } catch (err: any) { toast.error(err.message); }
    loadCategories();
  }

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    if (tab === "bookings") loadBookings();
    if (tab === "moderation") loadPortfolio();
    if (tab === "categories") loadCategories();
  }

  function handleBookingFilterChange(value: string) {
    setBookingFilter(value);
    setTimeout(loadBookings, 0);
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
            onClick={() => handleTabClick(tab.key)}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" && <OverviewTab stats={stats} />}
      {activeTab === "users" && <UsersTab users={users} onUpdateStatus={updateUserStatus} />}
      {activeTab === "bookings" && (
        <BookingsTab
          bookings={bookings}
          bookingFilter={bookingFilter}
          onBookingFilterChange={handleBookingFilterChange}
          onUpdateStatus={updateBookingStatus}
        />
      )}
      {activeTab === "incidents" && <IncidentsTab incidents={allIncidents} onUpdateStatus={updateIncident} />}
      {activeTab === "disputes" && <DisputesTab disputes={allDisputes} onUpdateStatus={updateDispute} />}
      {activeTab === "moderation" && <ModerationTab portfolio={portfolio} onModerate={moderatePortfolio} />}
      {activeTab === "categories" && (
        <CategoriesTab
          categories={categories}
          onCreate={createCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      )}
      {activeTab === "activity" && <ActivityTab logs={logs} />}
    </section>
  );
}
