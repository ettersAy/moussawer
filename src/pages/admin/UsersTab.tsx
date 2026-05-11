import {
  ArrowDown, ArrowUp, ArrowUpDown, BadgeCheck, ChevronLeft, ChevronRight,
  Pencil, Plus, Search, Trash2, UserCheck, UserX, X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { useToast } from "../../components/shared/Toast";
import { api, type User } from "../../lib/api";
import { UserFormModal } from "./UserFormModal";
import { UserRow } from "./UserRow";

type SortField = "name" | "email" | "role" | "status" | "createdAt";
type SortDir = "asc" | "desc";

const ROLE_OPTIONS = ["ALL", "ADMIN", "CLIENT", "PHOTOGRAPHER"] as const;
const STATUS_OPTIONS = ["ALL", "ACTIVE", "SUSPENDED", "DISABLED"] as const;
const PAGE_SIZES = [10, 25, 50, 100];

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) return <ArrowUpDown size={12} className="sort-icon" />;
  return sortDir === "asc" ? <ArrowUp size={12} className="sort-icon active" /> : <ArrowDown size={12} className="sort-icon active" />;
}

export function UsersTab() {
  const toast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 25, total: 0, totalPages: 0 });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [formUser, setFormUser] = useState<User | undefined | null>(undefined);

  const [confirmDelete, setConfirmDelete] = useState<User | null>(null);
  const [confirmRole, setConfirmRole] = useState<{ user: User; role: string } | null>(null);
  const [confirmDisable, setConfirmDisable] = useState<User | null>(null);
  const [confirmBulk, setConfirmBulk] = useState<{ action: string; ids: string[] } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setMeta((m) => ({ ...m, page: 1 }));
  }, [debouncedSearch, roleFilter, statusFilter, sortField, sortDir]);

  const loadUsers = useCallback(async (pageOverride?: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const p = pageOverride ?? meta.page;
      params.set("page", String(p));
      params.set("limit", String(meta.limit));
      params.set("sortBy", sortField);
      params.set("sortOrder", sortDir);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (roleFilter !== "ALL") params.set("role", roleFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await api<User[]>(`/admin/users?${params.toString()}`);
      setUsers(res.data);
      if (res.meta) setMeta(res.meta as typeof meta);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, sortField, sortDir, meta.limit, toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [users]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  async function updateStatus(user: User, newStatus: string) {
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", body: { status: newStatus } });
      toast.success(`User ${newStatus.toLowerCase()}.`);
      loadUsers();
    } catch { toast.error("Failed to update status"); }
  }

  async function changeRole(user: User, newRole: string) {
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", body: { role: newRole } });
      toast.success(`User role changed to ${newRole.toLowerCase()}.`);
      loadUsers();
    } catch { toast.error("Failed to update role"); }
    setConfirmRole(null);
  }

  async function toggleVerified(user: User) {
    if (!user.photographerProfile) return;
    const newVal = !user.photographerProfile.verified;
    try {
      await api(`/admin/users/${user.id}`, { method: "PATCH", body: { verified: newVal } });
      toast.success(newVal ? "Photographer verified." : "Verification removed.");
      loadUsers();
    } catch { toast.error("Failed to update verification status"); }
  }

  async function deleteUser(user: User) {
    try {
      await api(`/admin/users/${user.id}`, { method: "DELETE" });
      toast.success(`User "${user.name}" deleted.`);
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
    setConfirmDelete(null);
  }

  async function executeBulk(action: string, ids: string[]) {
    try {
      if (action === "delete") {
        await Promise.all(ids.map((id) => api(`/admin/users/${id}`, { method: "DELETE" })));
        toast.success(`${ids.length} user(s) deleted.`);
      } else if (action === "activate") {
        await Promise.all(ids.map((id) => api(`/admin/users/${id}`, { method: "PATCH", body: { status: "ACTIVE" } })));
        toast.success(`${ids.length} user(s) activated.`);
      } else if (action === "suspend") {
        await Promise.all(ids.map((id) => api(`/admin/users/${id}`, { method: "PATCH", body: { status: "SUSPENDED" } })));
        toast.success(`${ids.length} user(s) suspended.`);
      }
      loadUsers();
    } catch { toast.error("Bulk action failed."); }
    setConfirmBulk(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  }

  const allSelected = users.length > 0 && selectedIds.size === users.length;

  const pages = useMemo(() => {
    const arr: number[] = [];
    const tp = meta.totalPages;
    const cp = meta.page;
    if (tp <= 7) {
      for (let i = 1; i <= tp; i++) arr.push(i);
    } else {
      arr.push(1);
      if (cp > 3) arr.push(-1);
      const start = Math.max(2, cp - 1);
      const end = Math.min(tp - 1, cp + 1);
      for (let i = start; i <= end; i++) arr.push(i);
      if (cp < tp - 2) arr.push(-1);
      arr.push(tp);
    }
    return arr;
  }, [meta.totalPages, meta.page]);

  function getActionButtons(user: User) {
    const buttons: { label: string; icon: React.ReactNode; onClick: () => void; className?: string }[] = [];

    if (user.status === "ACTIVE") {
      buttons.push({ label: "Suspend", icon: <UserX size={14} />, onClick: () => updateStatus(user, "SUSPENDED") });
      buttons.push({ label: "Disable", icon: <X size={14} />, onClick: () => setConfirmDisable(user), className: "danger" });
    } else if (user.status === "SUSPENDED") {
      buttons.push({ label: "Activate", icon: <UserCheck size={14} />, onClick: () => updateStatus(user, "ACTIVE") });
      buttons.push({ label: "Disable", icon: <X size={14} />, onClick: () => setConfirmDisable(user), className: "danger" });
    } else {
      buttons.push({ label: "Activate", icon: <UserCheck size={14} />, onClick: () => updateStatus(user, "ACTIVE") });
    }

    return buttons;
  }

  return (
    <div className="admin-section">
      <section className="panel">
        <h2>Manage Users {!loading && <span className="count-badge">{meta.total}</span>}</h2>

        <div className="users-toolbar">
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => { setSearch(""); searchRef.current?.focus(); }} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r === "ALL" ? "All Roles" : r.toLowerCase()}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s === "ALL" ? "All Statuses" : s.toLowerCase()}</option>)}
          </select>
          <select value={String(meta.limit)} onChange={(e) => setMeta((m) => ({ ...m, limit: Number(e.target.value), page: 1 }))} className="filter-select page-size-select">
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} per page</option>)}
          </select>
          <button className="solid-button compact" onClick={() => setFormUser(null)}>
            <Plus size={14} /> Create User
          </button>
        </div>

        {selectedIds.size > 0 && (
          <div className="bulk-bar">
            <span className="bulk-count">{selectedIds.size} selected</span>
            <button className="ghost-button compact" onClick={() => setConfirmBulk({ action: "activate", ids: Array.from(selectedIds) })}>
              <UserCheck size={14} /> Activate all
            </button>
            <button className="ghost-button compact" onClick={() => setConfirmBulk({ action: "suspend", ids: Array.from(selectedIds) })}>
              <UserX size={14} /> Suspend all
            </button>
            <button className="ghost-button compact danger" onClick={() => setConfirmBulk({ action: "delete", ids: Array.from(selectedIds) })}>
              <Trash2 size={14} /> Delete all
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Loading users…</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found.</div>
        ) : (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th className="col-check">
                    <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Select all users" />
                  </th>
                  <th className="col-avatar"></th>
                  <th className="col-sortable" onClick={() => toggleSort("name")}>
                    Name <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="col-sortable" onClick={() => toggleSort("email")}>
                    Email <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="col-sortable" onClick={() => toggleSort("role")}>
                    Role <SortIcon field="role" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="col-sortable" onClick={() => toggleSort("status")}>
                    Status <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="col-sortable" onClick={() => toggleSort("createdAt")}>
                    Joined <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                  </th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelected={selectedIds.has(user.id)}
                    isExpanded={expandedId === user.id}
                    onToggleSelect={() => toggleSelect(user.id)}
                    onToggleExpand={() => setExpandedId(expandedId === user.id ? null : user.id)}
                    actionButtons={getActionButtons(user)}
                    onRoleChange={(role) => setConfirmRole({ user, role })}
                    onToggleVerified={toggleVerified}
                    onDelete={() => setConfirmDelete(user)}
                    onEdit={() => setFormUser(user)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="pagination">
            <button
              className="icon-button compact"
              disabled={meta.page <= 1}
              onClick={() => loadUsers(meta.page - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            {pages.map((p, i) =>
              p === -1 ? (
                <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
              ) : (
                <button
                  key={p}
                  className={`page-btn ${meta.page === p ? "active" : ""}`}
                  onClick={() => loadUsers(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              className="icon-button compact"
              disabled={meta.page >= meta.totalPages}
              onClick={() => loadUsers(meta.page + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
            <span className="page-info">
              {meta.total} user{meta.total !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Delete user?"
        message={`Are you sure you want to permanently delete "${confirmDelete?.name}" (${confirmDelete?.email})? This will cascade delete all associated data including bookings, messages, and profile information. This action cannot be undone.`}
        confirmLabel="Delete permanently"
        variant="danger"
        onConfirm={() => confirmDelete && deleteUser(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmDialog
        open={confirmDisable !== null}
        title="Disable account?"
        message={`Disable "${confirmDisable?.name}"? They will not be able to log in or use the platform. This can be reversed by setting the account back to ACTIVE.`}
        confirmLabel="Disable account"
        variant="danger"
        onConfirm={() => { if (confirmDisable) { updateStatus(confirmDisable, "DISABLED"); setConfirmDisable(null); } }}
        onCancel={() => setConfirmDisable(null)}
      />
      <ConfirmDialog
        open={confirmRole !== null}
        title="Change user role?"
        message={`Change "${confirmRole?.user.name}"'s role from ${confirmRole?.user.role.toLowerCase()} to ${confirmRole?.role.toLowerCase()}? This may affect their platform access and capabilities.`}
        confirmLabel="Change role"
        variant="warning"
        onConfirm={() => confirmRole && changeRole(confirmRole.user, confirmRole.role)}
        onCancel={() => setConfirmRole(null)}
      />
      <ConfirmDialog
        open={confirmBulk !== null}
        title={`Bulk ${confirmBulk?.action}?`}
        message={`This will ${confirmBulk?.action} ${confirmBulk?.ids.length} user account(s). Are you sure?`}
        confirmLabel={`${confirmBulk?.action} ${confirmBulk?.ids.length} user(s)`}
        variant={confirmBulk?.action === "delete" ? "danger" : "warning"}
        onConfirm={() => confirmBulk && executeBulk(confirmBulk.action, confirmBulk.ids)}
        onCancel={() => setConfirmBulk(null)}
      />

      <UserFormModal
        open={formUser !== undefined}
        user={formUser ?? null}
        onClose={() => setFormUser(undefined)}
        onSaved={() => { loadUsers(); toast.success(formUser === null ? "User created." : "User updated."); }}
      />
    </div>
  );
}
