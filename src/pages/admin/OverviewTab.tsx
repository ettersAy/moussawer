import { Activity, CalendarClock, Camera, FileWarning, Shield, ShieldAlert, UserCheck, Users } from "lucide-react";
import { Metric } from "./Metric";

type AdminStats = {
  totalUsers: number; totalPhotographers: number; totalClients: number;
  totalBookings: number; pendingBookings: number; openIncidents: number;
  openDisputes: number; recentMessages: number; moderationQueue: number;
};

export function OverviewTab({ stats }: { stats: AdminStats | null }) {
  if (!stats) {
    return (
      <div className="admin-section">
        <div className="panel"><p className="muted">Loading stats...</p></div>
      </div>
    );
  }

  return (
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
  );
}
