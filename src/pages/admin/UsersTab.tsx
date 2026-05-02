import { UserCheck, UserX } from "lucide-react";
import { StatusBadge } from "../../components/StatusBadge";
import type { User } from "../../lib/api";

export function UsersTab({
  users,
  onUpdateStatus
}: {
  users: User[];
  onUpdateStatus: (user: User, status: string) => void;
}) {
  return (
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
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(u, "SUSPENDED")}>
                    <UserX size={15} /> Suspend
                  </button>
                ) : (
                  <button className="ghost-button compact" onClick={() => onUpdateStatus(u, "ACTIVE")}>
                    <UserCheck size={15} /> Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
